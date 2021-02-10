package au.org.ala.ecodata

import com.mongodb.*
import org.grails.datastore.mapping.mongo.MongoSession
import grails.validation.ValidationException

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
        String internalPersonId = props.internalPersonId
            try {
                String personId = Identifiers.getNew(true,'') 
                props.personId = personId
                props.internalPersonId = props.internalPersonId ? props.internalPersonId : personId
                def person = new Person(props)
                person.projects = props.projects.flatten()
                person.save(failOnError: true)
                return [status:'ok', personName: person.lastName]
            } catch (ValidationException e){
                e.printStackTrace()
                Person.withSession { session -> session.clear() }
                def error = "A person with internal ID ${props.internalPersonId} already exists. Try a different ID."
                return [status:'error', error:error]
            } catch (Exception e) {
                e.printStackTrace()
                // clear session to avoid exception when GORM tries to autoflush the changes
                Person.withSession { session -> session.clear() }
                def error = "Error creating person ${props.firstName} ${props.lastName} - ${e.message}"
                log.error(error, e)
                return [status:'error', error:error]
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

    def addSiteForPerson(String personId, String siteId, String ctx){
        Person person = get(personId)
        Map props = [:]
        if (ctx == 'owner'){
            if (person?.ownedSites){
                person.ownedSites.push(siteId)
            } else {
            person.ownedSites = [siteId]
            }
            props = [ownedSites : person.ownedSites]
        } else if (ctx == 'booking'){
            if (person?.bookedSites){
                person.bookedSites.push(siteId)
            } else {
            person.bookedSites = [siteId]
            }
            props = [bookedSites: person.bookedSites]
        }
        commonService.updateProperties(person, props)
    }

    // def addSiteOwnership(String personId, String siteId){
    //     // TODO - check if the site is already owned by the person to avoid having multiple copies of the id stored

    //     Person person = get(personId)

    //     log.debug "props with owned sites: " + props

    //     commonService.updateProperties(person, props)
    // }

    // def addBookedSites(String siteId, String personId){
    //     Person person = get(personId)
    //     if (person?.bookedSites){
    //         person.bookedSites.push(siteId)
    //     } else {
    //     person.bookedSites = [siteId]
    //     }
    //     def props = [bookedSites : person.bookedSites]
    //     log.debug "props " + props
    //     commonService.updateProperties(person, props)
    // }

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

    def getPersonByUserId(String userId) {
        def person = Person.findByUserId(userId)    
        person
    }

    List getSiteIdsForPerson(person){
        List siteIds = []
        List ownedSites = person?.ownedSites
        List bookedSites = person?.bookedSites
        ownedSites?.each {
            siteIds << it
        }
        bookedSites?.each {
            siteIds << it
        }
        siteIds
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
