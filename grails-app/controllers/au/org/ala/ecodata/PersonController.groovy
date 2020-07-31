package au.org.ala.ecodata

import grails.converters.JSON

import com.mongodb.*
import org.grails.datastore.mapping.mongo.MongoSession


class PersonController {

    PersonService personService

    def index() {
        log.debug "Total persons = ${Person.count()}"
        render "${Person.count()} volunteers"
    }

    def get(String projectId) {

        log.debug params

        def list = []
        def persons = Person.list()
            // Person.findAllByRegisteredOnline('false') // should be findByProject(params.project) or something
        persons.each { person ->
            log.debug person.lastName
            list << person
        }
        list.sort {it.lastName}
        log.debug "list - map of persons" + list
        def result = [data: list] 
        render result as JSON
    }

    @RequireApiKey
    def create() {
        def props = request.JSON
        log.debug props
        personService.create(props);
    }


    @RequireApiKey
    def edit(Long id) {
        // respond personService.get(id)
    }

    // @RequireApiKey
    // def update(Person person) {
    //     if (person == null) {
    //         notFound()
    //         return
    //     }

    //     personService.save(person)


    //     request.withFormat {
    //         form multipartForm {
    //             flash.message = message(code: 'default.updated.message', args: [message(code: 'person.label', default: 'Person'), person.id])
    //             redirect person
    //         }
    //         '*'{ respond person, [status: OK] }
    //     }
    // }

    // @RequireApiKey
    // def delete(Long id) {
    //     if (id == null) {
    //         notFound()
    //         return
    //     }

    //     personService.delete(id)

    //     request.withFormat {
    //         form multipartForm {
    //             flash.message = message(code: 'default.deleted.message', args: [message(code: 'person.label', default: 'Person'), id])
    //             redirect action:"index", method:"GET"
    //         }
    //         '*'{ render status: NO_CONTENT }
    //     }
    // }

}
