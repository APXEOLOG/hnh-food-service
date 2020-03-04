<template>
    <div class="container">
        <div class="row p-3">
            <div class="col-6">
                Food Variations: {{ foodArray.length }}
            </div>
            <div class="col-6">
                Data file link: <a v-bind:href="fileLocation" target="_blank">{{ fileLocation }}</a>
            </div>
        </div>
        <div class="row">
            <div class="col-11">
                <vue-good-table
                        :fixed-header="true"
                        max-height="80vh"
                        :search-options="{
                            enabled: true,
                            placeholder: 'Search by Name',
                        }"
                        :pagination-options="{
                    enabled: true,
                    mode: 'pages',
                    perPage: 10,
                    position: 'bottom',
                    perPageDropdown: [10, 15, 30, 50],
                    dropdownAllowAll: false,
                    setCurrentPage: 1,
                    nextLabel: 'next',
                    prevLabel: 'prev',
                    rowsPerPageLabel: 'Rows per page',
                    ofLabel: 'of',
                    pageLabel: 'page', // for 'pages' mode
                    allLabel: 'All',
                  }"
                        :columns="columns"
                        :rows="foodArray">
                    <template slot="table-row" slot-scope="props">
                        <span v-if="props.column.field === 'f'">
                            <FEPBar v-bind:feps="props.row.f"></FEPBar>
                        </span>
                        <span v-else-if="props.column.field === 'i'">
                            {{ props.row.i.map(it => `${it.n}: ${it.v}%`).join(', ')}}
                        </span>
                        <span v-else>
                          {{props.formattedRow[props.column.field]}}
                        </span>
                    </template>
                </vue-good-table>
            </div>
        </div>
    </div>
</template>

<script>
    // import the styles
    import 'vue-good-table/dist/vue-good-table.css'
    import {VueGoodTable} from 'vue-good-table';
    import FEPBar from "@/components/FEPBar";

    /*

export interface MinifiedFoodInfo {
    t: string; // title
    r: string; // resource
    e: number; // energy
    h: number; // hunger
    i: { // ingredients
        n: string; // name
        v: number; // value
    }[];
    f: { // feps
        n: string; // name
        v: number; // value
    }[];
}
     */

    const filterFeps = (data, filterString) => {
        for (let i = 0; i < data.length; i++) {
            if (data[i].n.includes(filterString)) return true;
        }
        return false;
    }

    export default {
        name: "FoodTable",
        props: ['items'],
        components: {
            FEPBar,
            VueGoodTable,
        },
        data: function () {
            return {
                columns: [
                    {
                        label: 'Name',
                        field: 't',
                    },
                    {
                        label: 'FEP',
                        field: 'f',
                        filterOptions: {
                            enabled: true,
                            filterDropdownItems: [
                                {value: 'Strength', text: 'Strength'},
                                {value: 'Agility', text: 'Agility'},
                                {value: 'Intelligence', text: 'Intelligence'},
                                {value: 'Constitution', text: 'Constitution'},
                                {value: 'Perception', text: 'Perception'},
                                {value: 'Charisma', text: 'Charisma'},
                                {value: 'Dexterity', text: 'Dexterity'},
                                {value: 'Will', text: 'Will'},
                                {value: 'Psyche', text: 'Psyche'},
                            ],
                            filterFn: filterFeps,
                        },
                        sortable: false,
                    },
                    {
                        label: 'Ingredients',
                        field: 'i',
                        sortable: false,
                    },
                    {
                        label: 'Energy',
                        field: 'e',
                        type: 'number'
                    },
                    {
                        label: 'Hunger',
                        field: 'h',
                        type: 'number',
                    },
                ],
                fileLocation: `${window.location.href}data/food-info.json`,
            };
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