import SearchForm from "./src/components/Search/SearchForm";
import SearchResults from "./src/components/Search/SearchResults";
import SearchPagination from "./src/components/Search/SearchPagination";
import StoreModule from "./src/store/Larasearch";

const LarasearchVue = {
	install(vue, options) {
		if (!options.store) {
			throw new Error(
				"You need to pass the vuex store to the larasearch plugin as { store: MyStore }"
			);
		}

		const config = {
			apiHeaders: {},
			...(window.Larasearch || {}),
			...(options || {}),
		};
		delete config.store;

		options.store.registerModule("larasearch", StoreModule);

		vue.config.globalProperties.$larasearch = config;
		vue.component("LarasearchForm", SearchForm);
		vue.component("LarasearchResults", SearchResults);
		vue.component("LarasearchPagination", SearchPagination);
	},
};

export default LarasearchVue;
