package au.org.ala.ecodata

import com.mongodb.*
import org.grails.datastore.mapping.mongo.MongoSession
import groovy.json.JsonSlurper


class PersonService {

    def grailsApplication
    
    def getCommonService() {
        grailsApplication.mainContext.commonService
    }

    @RequireApiKey
    def create(Map props) {
        log.debug props

        def person = new Person(props)
        try {
            person.save(failOnError: true)
            log.debug "person saved"
            return [status:'created']
        } catch (Exception e) {
            e.printStackTrace()
            // clear session to avoid exception when GORM tries to autoflush the changes
            Person.withSession { session -> session.clear() }
            def error = "Error creating person ${props.firstName} ${props.lastName} - ${e.message}"
            log.error(error, e)
            return [status:'error',error:error]
        }
    }

    def update(Map props, String id){
        log.debug "props for an update" + props 
        Person person = Person.findPersonByPersonId(id)
        log.debug "person to update is " + person
        if (person){
            try {
                getCommonService().updateProperties(person, props)
                return [status:'ok']
            } catch (Exception e) {
                Person.withSession { session -> session.clear() }
                def error = "Error updating - ${e.message}"
                log.error error
                return [status:'error',error:error]
            }
        } else {
            def error = "Error updating person - no such id ${id}"
            log.error error
            return [status:'error',error:error]
        }
    }


    def get(String id){
        log.debug "person id in service " + id
        def person = Person.findByPersonId(id)
        log.debug "person is" + person
        person
    }

    def list() {
        log.debug "inside list"
        def list = []
        def persons = params.includeDeleted ? Person.list() :
            Person.find()  // should be findByProject(params.project) or something
        persons.each { person ->
            list.data << personService.toMap(person)
        }
        list.sort {it.lastName}
        list
    }

    Map delete(String id) {
        log.debug "delete in service"
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
