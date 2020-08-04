package au.org.ala.ecodata

import com.mongodb.*
import org.grails.datastore.mapping.mongo.MongoSession
import groovy.json.JsonSlurper


class PersonService {

    def create(Map props) {
        log.debug props

        def person = new Person(props)
        try {
            person.save(failOnError: true)
            log.debug "person saved"
            return [status:'ok']
        } catch (Exception e) {
            e.printStackTrace()
            // clear session to avoid exception when GORM tries to autoflush the changes
            Person.withSession { session -> session.clear() }
            def error = "Error creating person ${props.firstName} ${props.lastName} - ${e.message}"
            log.error(error, e)
            return [status:'error',error:error]
        }
    }

    def get(String projectId){
        log.debug "inside get"
        log.debug projectId
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
}
