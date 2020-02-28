<template>
    <div>
        <vue-good-table
                :columns="columns"
                :rows="rows"/>
    </div>
</template>

<script>
    // import the styles
    import 'vue-good-table/dist/vue-good-table.css'
    import { VueGoodTable } from 'vue-good-table';

    export default {
        name: "FoodTable",
        props: ['items'],
        components: {
            VueGoodTable,
        },
        computed: {
            foodArray: function () {
                return Object.values(this.items);
            }
        }
    }
</script>

<style scoped>

</style>