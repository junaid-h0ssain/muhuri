import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	signInEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		if (!email || !password) {
			return fail(400, { message: 'Email and password are required' });
		}

		try {
			await auth.api.signInEmail({
				body: {
					email,
					password,
					callbackURL: '/'
				},
				headers: event.request.headers
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Invalid email or password' });
			}
			return fail(500, { message: 'Unexpected error occurred during sign in' });
		}

		return redirect(302, '/');
	},
	signInSocial: async (event) => {
		const formData = await event.request.formData();
		const provider = formData.get('provider')?.toString() ?? 'github';
		const callbackURL = formData.get('callbackURL')?.toString() ?? '/';

		try {
			const result = await auth.api.signInSocial({
				body: {
					provider: provider as 'github',
					callbackURL
				},
				headers: event.request.headers
			});

			if (result.url) {
				return redirect(302, result.url);
			}
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Social sign-in failed' });
			}
			return fail(500, { message: 'Unexpected error occurred during social sign in' });
		}

		return fail(400, { message: 'Social sign-in failed' });
	}
};
