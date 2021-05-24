<script>
export default {
    methods: {
        initSearch(group, params) {},

        brforeSearch(group, params) {
            return params;
        },

        afterSearch(group, params) {},

        brforeClear(group, params) {
            return params;
        },

        afterClear(group, params) {},

        editRecord(group, record) {},

        beforeDeleteRecord(group, record) {
            return Promise.resolve(true);
        },

        afterDeleteRecord(group, record) {},
    }
};
</script>
