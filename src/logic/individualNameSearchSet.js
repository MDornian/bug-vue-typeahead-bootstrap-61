import _ from 'lodash'

// Create a map of names whose values are a set of individuals with that name.  All names converted to lower case.
export function buildIndividualNameSearchMap(family) {
  const map = new Map()

  // Let's get all the names for each individual
  for (const key of Object.getOwnPropertyNames(family)) {
    if (key.startsWith('I')) {
      const individual = family[key];

      // Get all the names we are interested in.
      const names1 = _.get(individual, 'name.fullName', '').toLowerCase().split(' ')
      const names2 = _.get(individual, 'name.surname', '').toLowerCase().split(' ')
      const names3 = _.get(individual, 'name.marriedName', '').toLowerCase().split(' ')
      const names4 = _.get(individual, 'name.nickname', '').toLowerCase().split(' ')

      // ... and combine them together into a unique list
      const names = new Set([...names1, ...names2, ...names3, ...names4])

      // Work through each of this individual's names
      for (let name of Array.from(names).filter(x => x)) {
        let s = map.get(name)

        // Add this new name to our map
        if (!s) {
          s = new Set()
          map.set(name, s)
        }
        
        // Add to this individual to this name's set
        s.add(key)
      }
    }
  }

  return map
}

// Splits the search text into multiple name parts and finds all individuals that match all the names
// Typeahead control does not support searching on multiple name parts.  To get around that set  `
//     v-model="searchText" 
//     :serializer="item => searchText" 
export function searchIndividualNames(searchText, family, searchMap) {
  const limit = 10
  const re = /\s*[\s|,|;|)|(]+\s*/   // At least one character, commas, colons, or parenthesis
  const searchNames = searchText.trim().toLowerCase().split(re)
  let individualIds = new Set()

  // The user must type at least two characters or at least two different names otherwise we will return an empty array
  if (searchNames.length === 1 && searchNames[0].length < 2) {
    return []
  }

  // Search all the names in the search text.  We allow a person to type 'Bo Sm' and this will search 'Bob' and 'Smith'
  for (let n = 0; n < searchNames.length; n++) {
    const searchName = searchNames[n]
    const subset = new Set()

    // Search all the names of our family
    for (const [name, individualIds] of searchMap) {

      // If the search name is in the name
      if (name.includes(searchName)) {

        // Add each of individuals in the set to the list of individuals found so far
        for (const individualId of individualIds) {
          subset.add(individualId)
        }
      }
    }

    if (n === 0) {
      individualIds = subset
    } else {
      individualIds = new Set([...individualIds].filter(x => subset.has(x)))  // Intersection between the two sets
    }
  }

  return Array          // Return what we have
    .from(individualIds)
    .map(x => family[x])  
    .sort( (a,b) => {
      const namea = _.get(a, 'name.fullName', '').toLowerCase()
      const nameb = _.get(b, 'name.fullName', '').toLowerCase()

      if (namea < nameb)
        return - 1
      else 
        return 1
    })
    .slice(0, limit)
}
