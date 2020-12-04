package au.org.ala.ecodata

import com.mongodb.*
import org.grails.datastore.mapping.mongo.MongoSession

/**
* For systematic monitoring - volunteer management 
*/

class PersonService {

    def grailsApplication, commonService

    /**
     * Create a new member of the project (person, not registered online)
     *
     * @props map containing personal details entered in a web form
     */

    // @RequireApiKey
    def create(Map props) {
        assert getCommonService()
        props.personId = Identifiers.getNew(true,'')
        def person = new Person(props)
        try {
            person.save(failOnError: true)
            log.debug "person saved is " + person.lastName
            return [status:'ok', personName: person.lastName]
        } catch (Exception e) {
            e.printStackTrace()
            // clear session to avoid exception when GORM tries to autoflush the changes
            Person.withSession { session -> session.clear() }
            def error = "Error creating person ${props.firstName} ${props.lastName} - ${e.message}"
            log.error(error, e)
            return [status:'error',error:error]
        }
    }

    /**
     * Update personal details of a member of a project 
     *
     * @param id of an existing person
     * @props map containing personal details entered in a web form
     */
    def update(String id, Map props){
        Person person = Person.findByPersonId(id)
        if (person){
            try {
                commonService.updateProperties(person, props)
                return [status:'ok', personName: person.lastName]
            } catch (Exception e) {
                Person.withSession { session -> session.clear() }
                def error = "Error updating person - ${e.message}"
                log.error error
                return [status:'error',error:error]
            }
        } else {
            def error = "Error updating person - no such id ${id}"
            log.error error
            return [status:'error',error:error]
        }
    }

    def addBookedSites(siteId, personId){
        Person person = get(personId)
        if (person?.bookedSites){
            person.bookedSites.push(siteId)
        } else {
        person.bookedSites = [siteId]
        }
        def props = [bookedSites : person.bookedSites]
        log.debug "props " + props
        commonService.updateProperties(person, props)
    }

    /**
     * Get personal details of a member of a project 
     *
     * @param id - of an existing person
     * @return person - map containing personal details of the member
     */
    def get(String id){
        try {
            def person = Person.findByPersonId(id)
            return person
        } catch (Exception e) {
            def error = "Error getting personal details - ${e.message}"
            log.error error, e
            return [status: 'error', error: error]
        }
        
    }

    def checkPersonExists(String id){
        def person = Person.findByPersonId(id)
        return person ? true : false
    }

    def getPersonId(userId) {
        def person = Person.findByUserId(userId)
        return person.personId
    }

    def getPersonIdByInternalPersonId(internalPersonId) {
        def person = Person.findByInternalPersonId(internalPersonId)
        log.debug "PERSON " + person
        def personId
        if (person){
            personId = person?.personId
        }
        return personId
    } 

    /**
     * Get a list of all members of a project 
     *
     * @param 
     * @return <List>persons
     */
    // def list() {
    //     def list = []
    //     def persons = params.includeDeleted ? Person.list() :
    //         Person.find()  // should be findByProject(params.project) or something
    //     persons.each { person ->
    //         list.data << personService.toMap(person)
    //     }
    //     list.sort {it.lastName}
    //     log.debug "list to populate person table" + list
    //     list
    // }


    Map delete(String id) {
        Person person = Person.findByPersonId(id)

        if (person) {
            // TODO would have to delete the person from other collections - like site? 
            person.delete(flush: true)
            [status: 'ok']
        } else {
            [status: 'error', error: 'No such id']
        }
    }
}
