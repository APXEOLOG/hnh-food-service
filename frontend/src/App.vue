<template>
    <div id="app">
        <loading :active.sync="loading"
                 :can-cancel="false"
                 :is-full-page="true"></loading>
        <FoodTable v-if="!loading" v-bind:items="items"></FoodTable>
    </div>
</template>

<script>
    import Loading from 'vue-loading-overlay';
    import 'vue-loading-overlay/dist/vue-loading.css';
    import FoodTable from "@/components/FoodTable";

    export default {
        name: 'App',
        components: {
            FoodTable,
            Loading,
        },
        data: function () {
            return {
                loading: true,
                items: []
            };
        },
        mounted: function () {
            this.$http.get('./data/food-info.json', {
                headers: {
                    'Cache-Control': 'no-cache'
                }
            }).then((response) => {
                this.items = response.data;
                this.loading = false;
            });
        }
    }
</script>

<style>

</style>
