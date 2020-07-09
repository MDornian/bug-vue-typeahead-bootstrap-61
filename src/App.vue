<template>
  <div id="app">
    <b-navbar toggleable="lg" type="dark" variant="info" sticky>
      <!-- Please note that the serializer just has the search text.  This is because the search logic is done elsewhere and this prevents any interfence with that.-->
      <vue-typeahead-bootstrap
          v-model="searchText"
          :data="individuals"
          :disabledValues="disabledValues"
          :serializer="item => searchText"  
          @hit="showIndividual"
          class="flex-grow-1"
          inputName="individualSearch"
          placeholder="Type an individual's name(s) to search"
      >
        <template slot="suggestion" slot-scope="{ data }">
          <div class="d-flex align-items-center">
            <span class="ml-4" v-html="data.name.fullName"></span>
          </div>
        </template>
      </vue-typeahead-bootstrap>  

      <b-navbar-brand>{{individualId}}</b-navbar-brand> 
    </b-navbar>
  </div>
</template>

<script>
import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap'
import _ from 'lodash'
import { buildIndividualNameSearchMap, searchIndividualNames } from '@/logic/individualNameSearchSet.js'
import json from '@/testData/data.json'

export default {
  name: 'App',
  components: {
    VueTypeaheadBootstrap
  },
  data() {
    return {
      family: json,
      disabledValues: [],
      individuals: [],
      individualId: '',
      searchText: ''
    }
  },
  calculated: {
    searchMap: function () {
      return buildIndividualNameSearchMap(this.family)
    }
  },
  methods: {
    getIndividualList: function () {
      this.individuals = searchIndividualNames(this.searchText, this.family, this.searchMap)
    },
    showIndividual: function (item) {
      this.individualId = item.id
    }
  },
  watch: {
    searchText: function () {
      this.debouncedGetIndividualList()
    }
  },
  created() {
    // Add this function to the component to handle debouncing within typing search text.
    this.debouncedGetIndividualList = _.debounce(this.getIndividualList, 400)
  },
  beforeMount() {
    this.searchMap = buildIndividualNameSearchMap(this.family)
  }
}
</script>