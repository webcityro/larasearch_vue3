import ApiCaller from "../core/ApiCaller";
import Helper from "../core/Helper";

const expand = (payload) => {
	if (!payload) {
		return "";
	}

	if (payload[0] === "{" || payload[0] === "[") {
		payload = JSON.parse(payload);
	}
	return payload;
};

const compact = (payload) => {
	if (typeof payload === "object") {
		payload = JSON.stringify(payload);
	}

	return payload;
};

export default {
	namespaced: true,

	state: {
		apiHeaders: {},
		params: {},
		orderByFields: {},
		urls: {},
		records: {},
		meta: {},
	},

	getters: {
		total: (state) => (group) => {
			return (state.meta[group] || {}).total || 0;
		},

		currentPage: (state) => (group) => {
			return (state.params[group] || {}).page || 1;
		},

		prevPage: (state) => (group) => {
			return (state.meta[group] || {}).prev_page || null;
		},

		nextPage: (state) => (group) => {
			return (state.meta[group] || {}).next_page || null;
		},

		lastPage: (state) => (group) => {
			return (state.meta[group] || {}).last_page || 1;
		},

		loading: (state) => (group) => {
			return (state.urls[group] || {}).loading || false;
		},
	},

	actions: {
		init(
			{ state, dispatch, commit },
			{ group, url, method, params, orderByFields, apiHeaders, dontSave }
		) {
			commit("SET_API_HEADERS", apiHeaders);
			commit("URL", {
				group,
				url: { url, method, loading: false },
			});

			const currentParams = dontSave
				? params
				: window.sessionStorage.getItem(group)
				? expand(window.sessionStorage.getItem(group))
				: params;
			commit("ORDER_BY_STORE", { group, orderByFields });

			return dispatch("store", { group, params: currentParams }).then(
				() => {
					return dispatch("fetch", group).then(() => {
						return state.params[group] || {};
					});
				}
			);
		},

		fetch({ state, commit }, group) {
			let { url, method } = state.urls[group];
			commit("LOADING", { group, loading: true });

			return ApiCaller.request(
				url,
				method,
				state.params[group],
				state.apiHeaders
			).then((response) => {
				commit("LOADING", { group, loading: false });
				commit("SET_RECORDS", {
					group,
					response: response.data,
				});

				if (
					response.data.params &&
					response.data.params !== state.params[group]
				) {
					commit("STORE", {
						group,
						params: response.data.params,
					});
				}
			});
		},

		goToFirstPageSortByIdDesc({ dispatch, state }, group) {
			if (!state.orderByFields[group].hasOwnProperty("id")) {
				console.log(
					"Larasearch error: You need to add ID to orderBy fields if you what to use the goToLastPageSortById on the group: " +
						group +
						"."
				);
				return;
			}

			const isMultiFieldsSearch = Helper.isObject(
				state.params[group].search
			);
			const params = {
				per_page: state.params[group].per_page,
				page: 1,
				search: isMultiFieldsSearch ? {} : "",
				order_by: "id:desc",
			};

			if (isMultiFieldsSearch) {
				Object.keys(state.params[group].search).forEach(
					(key) => (params.search[key] = "")
				);
			}

			dispatch("store", { group, params });
		},

		replaceRecord({ commit }, { group, record, idColumn }) {
			commit("REPLACE_RECORD", { group, record, idColumn });
		},

		store({ commit, dispatch }, { group, params }) {
			commit("STORE", { group, params });
			return dispatch("fetch", group);
		},

		reset({ state, dispatch }, payload) {
			return dispatch("store", payload).then(() => {
				return state.params[payload.group] || {};
			});
		},

		remove({ commit }, group) {
			commit("REMOVE", group);
		},
	},

	mutations: {
		SET_API_HEADERS(state, apiHeaders) {
			state.apiHeaders = apiHeaders;
		},

		SET_RECORDS(state, { group, response }) {
			state.records = {
				...state.records,
				...{ [group]: response.records },
			};

			state.meta = {
				...state.meta,
				...{ [group]: response.meta },
			};
		},

		STORE(state, { group, params }) {
			state.params = {
				...(state.params || {}),
				...{ [group]: params },
			};

			window.sessionStorage.setItem(group, compact(params));
		},

		URL(state, { group, url }) {
			state.urls = {
				...state.urls,
				...{ [group]: url },
			};
		},

		REPLACE_RECORD(state, { group, record, idColumn }) {
			const index = state.records[group].findIndex(
				(rec) => rec[idColumn] === record[idColumn]
			);
			state.records[group].splice(index, 1, record);
		},

		ORDER_BY_STORE(state, { group, orderByFields = {} }) {
			state.orderByFields = {
				...state.orderByFields,
				...{ [group]: orderByFields },
			};
		},

		REMOVE(state, group) {
			delete state.params[group];
			window.sessionStorage.removeItem(group);
		},

		LOADING(state, { group, loading }) {
			state.urls = {
				...state.urls,
				[group]: {
					...state.urls[group],
					loading,
				},
			};
		},
	},
};
