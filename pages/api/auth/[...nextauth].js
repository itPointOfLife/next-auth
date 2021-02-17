import nextAuth from 'next-auth';
import Providers from 'next-auth/providers';

const {Google: googleProvider} = Providers;

const auth = (request, response) =>
	nextAuth(request, response, {
		callbacks: {
			jwt: async (token, user, account) => {
				if (!user || !account) {
					return token;
				}

				const {accessToken, accessTokenExpires, provider, refreshToken} = account;

				if (provider !== 'google') {
					return token;
				}

				return {
					...token,
					accessToken,
					accessTokenExpires,
					refreshToken
				};
			},
			session: async (session, user) => {
				const {accessToken, accessTokenExpires, refreshToken} = user;

				return {
					...session,
					accessToken,
					accessTokenExpires,
					refreshToken
				};
			}
		},
		providers: [
			googleProvider({
				clientId: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				authorizationUrl:
					'https://accounts.google.com/o/oauth2/v2/auth?prompt=consent&access_type=offline&response_type=code',
				scope: [
					'https://www.googleapis.com/auth/userinfo.profile',
					'https://www.googleapis.com/auth/userinfo.email',
					'https://www.googleapis.com/auth/photoslibrary'
				].join(' ')
			})
		]
	});

export default auth;
