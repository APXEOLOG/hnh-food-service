<template>
    <div class="d-flex flex-row">
        <div class="fep-box" v-for="item in expanded" :key="item.code + '-' + item.num + '-' + item.value" v-bind:class="item.class">
            <div class="fep-value">{{ item.value }}</div>
            <div class="fep-type">{{ item.code }}+{{ item.num }}</div>
        </div>
    </div>
</template>

<script>
    const FepMapping = {
        'Strength': {
            code: 'str',
            order: 1,
        },
        'Agility': {
            code: 'agi',
            order: 2,
        },
        'Intelligence': {
            code: 'int',
            order: 3,
        },
        'Constitution': {
            code: 'con',
            order: 4,
        },
        'Perception': {
            code: 'prc',
            order: 5,
        },
        'Charisma': {
            code: 'cha',
            order: 6,
        },
        'Dexterity': {
            code: 'dex',
            order: 7,
        },
        'Will': {
            code: 'wil',
            order: 8,
        },
        'Psyche': {
            code: 'psy',
            order: 9,
        }
    };

    export default {
        name: "FEPBar",
        props: ['feps'],
        computed: {
            expanded: function () {
                const mappedFeps = this.feps.map(it => {
                    const parts = it.n.split(' ');
                    const item = {
                        ...FepMapping[parts[0]],
                        num: parseInt(parts[1], 10),
                        value: it.v,
                    };
                    item.class = `${item.code}${item.num}`;
                    return item;
                });
                mappedFeps.sort((a, b) => {
                    if (a.order === b.order) {
                        return a.num - b.num;
                    }
                    return a.order - b.order;
                });
                return mappedFeps;
            }
        }
    }
</script>

<style scoped>
    .fep-box {
        font-size: 12.0pt;
        text-align: center;
        width: 40px;
        color: #222;
        font-family: 'droid_sans_monoregular', monospace;
        word-spacing: -0.36em;
        letter-spacing: -0.080em;
    }

    .fep-value {
        font-weight: bold;
    }

    .fep-type {
        font-size: 10.0pt;
        color: #555;
    }

    .str1 {background-color: #BF9794; }
    .agi1 {background-color: #9995B8; }
    .int1 {background-color: #9DB7B9; }
    .con1 {background-color: #C29AB4; }
    .prc1 {background-color: #E4BF98; }
    .cha1 {background-color: #9BEEB1; }
    .dex1 {background-color: #FEFDCC; }
    .wil1 {background-color: #E4F38F; }
    .psy1 {background-color: #C48DFD; }

    .str2 {background-color: #DF958F; }
    .agi2 {background-color: #9991DC; }
    .int2 {background-color: #97D6DC; }
    .con2 {background-color: #E193C5; }
    .prc2 {background-color: #F2C28D; }
    .cha2 {background-color: #8EF7AA; }
    .dex2 {background-color: #FFFEA6; }
    .wil2 {background-color: #EEFF9E; }
    .psy2 {background-color: #C286FE; }

</style>