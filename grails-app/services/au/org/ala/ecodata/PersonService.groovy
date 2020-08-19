package au.org.ala.ecodata

import com.mongodb.*
import org.grails.datastore.mapping.mongo.MongoSession


class PersonService {

    def grailsApplication, commonService


    @RequireApiKey
    def create(Map props) {

        def person = new Person(props)
        try {
            person.save(failOnError: true)
            log.debug "person saved"
            // return [status:'updated', person: props.lastName]
        } catch (Exception e) {
            e.printStackTrace()
            // clear session to avoid exception when GORM tries to autoflush the changes
            Person.withSession { session -> session.clear() }
            def error = "Error creating person ${props.firstName} ${props.lastName} - ${e.message}"
            log.error(error, e)
            return [status:'error',error:error]
        }
    }

    def update(Map props, String id, boolean forceRefresh = false){
        Person person = Person.findByPersonId(id)
        if (person){
            try {
                commonService.updateProperties(person, props)
                // return [status:'updated', person: props.lastName]
            } catch (Exception e) {
                Person.withSession { session -> session.clear() }
                def error = "Error updating person ??? - ${e.message}"
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
        def person = Person.findByPersonId(id)
        person
    }

    def list() {
        def list = []
        def persons = params.includeDeleted ? Person.list() :
            Person.find()  // should be findByProject(params.project) or something
        persons.each { person ->
            list.data << personService.toMap(person)
        }
        list.sort {it.lastName}
        log.debug "list to populate person table" + list
        list
    }

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
