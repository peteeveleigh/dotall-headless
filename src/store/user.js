import Addresses from '@/queries/Addresses.gql';

/**
 * The main Vuex state for users.
 */
export const state = () => ({
	/**
	 * The users ID (if they are logged in)
	 */
	userId: null,
	/**
	 * Whether or not the user is logged in.
	 */
	isGuest: true,
	/**
	 * The user's email addresses.
	 */
	email: '',
	/**
	 * The user's addresses and other info.
	 */
	addresses: [],
});

/**
 * Getters. These return properties of the state.
 */
export const getters = {
	/**
	 * Get the users ID.
	 *
	 * NOTE: The `state` property is pulled in automatically.
	 */
	getUserId(state) {
		return state.userId;
	},
	/**
	 * Get whether or not the user is logged in.
	 *
	 * NOTE: The `state` property is pulled in automatically.
	 */
	getIsGuest(state) {
		return state.isGuest;
	},
	/**
	 * Get the users email.
	 *
	 * NOTE: The `state` property is pulled in automatically.
	 */
	getEmail(state) {
		return state.email;
	},
	/**
	 * Get all the addresses for the user.
	 *
	 * NOTE: The `state` property is pulled in automatically.
	 */
	getAddresses(state) {
		return state.addresses;
	},
};

export const mutations = {
	setUserId(state, payload) {
		state.userId = payload;
	},
	setIsGuest(state, payload) {
		state.isGuest = payload;
	},
	setEmail(state, payload) {
		state.email = payload;
	},
	setAddresses(state, payload) {
		state.addresses = payload;
	}
}

export const actions = {
	/**
	 * Gets the session data, user data and saves it into state.
	 * Initializes the steps in the checkout process based on if the user is logged in or not
	 *
	 * @param {function} commit - Vuex commit method.
	 * @param {function} dispatch - Vuex dispatch method
	 */
	async fetchSessionData({ commit, dispatch }) {
		// Get the session data from Craft and set it into state
		const sessionInfo = await this.$api.get('/actions/users/session-info');
		commit('setCsrfToken', sessionInfo.csrfTokenValue, { root: true });
		commit('setIsGuest', sessionInfo.isGuest);
		if (!sessionInfo.isGuest) {
			commit('setUserId', sessionInfo.id);
			commit('setEmail', sessionInfo.email);
			// await dispatch('fetchAddresses', sessionInfo.id);
		}
		dispatch('checkout/fetchSteps', sessionInfo.isGuest, { root: true });
	},
	/**
	 * Uses GraphQL to fetch the logged in users addresses from Craft and places them in state
	 *
	 * @param {function} commit - Vuex commit method.
	 * @param {function} getters - Vuex getter method
	 */
	async fetchAddresses({ commit, getters }, userId) {
		console.log('The user ID in fetch addresses', userId);
		const { data } = await this.$api.graphqlQuery(
			Addresses,
			{
				ownerId: userId
			}
		);
		// Filter out the main store address
		const addresses = data.addresses.filter((address) => {
			return address.title !== 'Store';
		});

		commit('setAddresses', addresses);
	},

	async updateAddress({ dispatch }, address) {
		const { data } = await this.$api.updateAddress(address);
		console.log(data);
	}
}
