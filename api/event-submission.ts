const FALLBACK_EMAIL = process.env.SUBMISSION_INBOX_EMAIL || 'hello@techweeknyc.com';

type Submission = {
	form_name?: string;
	provider_url?: string;
	title: string;
	host: string;
	date: string;
	time_window: string;
	vertical?: string;
	format?: string;
	venue: string;
	description: string;
	email: string;
};

function json(body: unknown, init: ResponseInit = {}) {
	return new Response(JSON.stringify(body), {
		...init,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			...init.headers,
		},
	});
}

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function toText(value: FormDataEntryValue | string | undefined) {
	return typeof value === 'string' ? value.trim() : '';
}

function toSubmission(raw: Record<string, FormDataEntryValue | string | undefined>): Submission {
	return {
		form_name: toText(raw.form_name),
		provider_url: toText(raw.provider_url),
		title: toText(raw.title),
		host: toText(raw.host),
		date: toText(raw.date),
		time_window: toText(raw.time_window),
		vertical: toText(raw.vertical),
		format: toText(raw.format),
		venue: toText(raw.venue),
		description: toText(raw.description),
		email: toText(raw.email),
	};
}

function validateSubmission(submission: Submission) {
	const errors: string[] = [];
	if (!submission.title) errors.push('Event title is required.');
	if (!submission.host) errors.push('Host or organizing team is required.');
	if (!submission.date) errors.push('Date is required.');
	if (!submission.time_window) errors.push('Time window is required.');
	if (!submission.venue) errors.push('Venue is required.');
	if (!submission.description) errors.push('Short description is required.');
	if (!submission.email || !submission.email.includes('@')) errors.push('A valid contact email is required.');
	return errors;
}

function buildMailto(submission: Submission) {
	const subject = encodeURIComponent(`Build Week NYC submission: ${submission.title}`);
	const body = encodeURIComponent(
		[
			`Event title: ${submission.title}`,
			`Host: ${submission.host}`,
			`Provider link: ${submission.provider_url || 'n/a'}`,
			`Date: ${submission.date}`,
			`Time window: ${submission.time_window}`,
			`Vertical: ${submission.vertical || 'n/a'}`,
			`Format: ${submission.format || 'n/a'}`,
			`Venue: ${submission.venue}`,
			`Contact email: ${submission.email}`,
			'',
			'Description:',
			submission.description,
		].join('\n'),
	);

	return `mailto:${FALLBACK_EMAIL}?subject=${subject}&body=${body}`;
}

function htmlPage({
	title,
	message,
	linkHref,
	linkLabel,
}: {
	title: string;
	message: string;
	linkHref: string;
	linkLabel: string;
}) {
	return new Response(
		`<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>Finish your submission</title>
		<style>
			body { font-family: ui-sans-serif, system-ui, sans-serif; background: #fef6e7; color: #322e25; margin: 0; }
			main { max-width: 42rem; margin: 0 auto; padding: 4rem 1.5rem; }
			.panel { background: rgba(255, 251, 245, 0.88); border-radius: 1rem; padding: 1.5rem; box-shadow: 0 8px 24px rgba(50, 46, 37, 0.15); }
			a { color: #100300; font-weight: 700; }
		</style>
	</head>
	<body>
		<main>
			<div class="panel">
				<h1>${escapeHtml(title)}</h1>
				<p>${escapeHtml(message)}</p>
				<p><a href="${escapeHtml(linkHref)}">${escapeHtml(linkLabel)}</a></p>
				<p><a href="/events/submit">Back to the form</a></p>
			</div>
		</main>
	</body>
</html>`,
		{
			status: 200,
			headers: {
				'Content-Type': 'text/html; charset=utf-8',
			},
		},
	);
}

function fallbackHtml(submission: Submission) {
	return htmlPage({
		title: 'Finish your submission in email',
		message: 'The webhook inbox is not configured yet, so this form is ready to hand off through email instead.',
		linkHref: buildMailto(submission),
		linkLabel: `Open a prefilled draft to ${FALLBACK_EMAIL}`,
	});
}

function errorHtml(message: string) {
	return htmlPage({
		title: 'Something’s not right, let’s try again.',
		message,
		linkHref: '/events/submit',
		linkLabel: 'Return to the submission form',
	});
}

async function parseSubmission(request: Request) {
	const contentType = request.headers.get('content-type') || '';
	if (contentType.includes('application/json')) {
		const payload = (await request.json()) as Record<string, string>;
		return {
			mode: 'json',
			submission: toSubmission(payload),
		};
	}

	if (
		contentType.includes('application/x-www-form-urlencoded') ||
		contentType.includes('multipart/form-data')
	) {
		const formData = await request.formData();
		return {
			mode: 'form',
			submission: toSubmission(Object.fromEntries(formData.entries())),
		};
	}

	return null;
}

export default {
	async fetch(request: Request) {
		if (request.method !== 'POST') {
			return json({ error: 'Method not allowed.' }, { status: 405 });
		}

		const parsed = await parseSubmission(request);
		if (!parsed) {
			return json({ error: 'Unsupported content type.' }, { status: 415 });
		}

		const errors = validateSubmission(parsed.submission);
		if (errors.length > 0) {
			if (parsed.mode === 'form') {
				return errorHtml(errors[0]);
			}
			return json({ error: errors[0], errors }, { status: 400 });
		}

		const payload = {
			...parsed.submission,
			submittedAt: new Date().toISOString(),
			source: 'techweeknyc.com',
		};
		const webhookUrl = process.env.EVENT_SUBMISSION_WEBHOOK_URL;

		if (!webhookUrl) {
			if (parsed.mode === 'form') {
				return fallbackHtml(parsed.submission);
			}
			return json({
				ok: true,
				delivery: 'mailto',
				fallbackEmail: FALLBACK_EMAIL,
				mailto: buildMailto(parsed.submission),
			});
		}

		try {
			const response = await fetch(webhookUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				return json({ error: 'Webhook delivery failed.' }, { status: 502 });
			}
		} catch {
			return json({ error: 'Webhook delivery failed.' }, { status: 502 });
		}

		if (parsed.mode === 'form') {
			return Response.redirect(new URL('/events/submit/success', request.url), 303);
		}

		return json({ ok: true, delivery: 'webhook' });
	},
};
