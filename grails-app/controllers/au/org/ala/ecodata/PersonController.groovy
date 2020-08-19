package au.org.ala.ecodata

import grails.converters.JSON

import com.mongodb.*
import org.grails.datastore.mapping.mongo.MongoSession


class PersonController {

    PersonService personService

    def get(String id) {
        def result = personService.get(id)
        render result as JSON
    }

    def list(String projectId) {

        def list = []
        def persons = Person.list()
            // TODO should be findByProject(params.project) or something but person doesn't store projectId now
        persons.each { person ->
            list << person
        }
        list.sort {it.lastName}
        def result = [data: list] 

        render result as JSON
    }

    @RequireApiKey
    def create() {
        def props = request.JSON
        personService.create(props);
    }


    @RequireApiKey
    def update(String id) {
        def props = request.JSON
        personService.update(props, id)
    }

    @RequireApiKey
    def delete(String id) {
        Person person = Person.findByPersonId(id)
        if (person) {
            boolean destroy = params.destroy == null ? false : params.destroy.toBoolean()
            Map result = personService.delete(id)
            if (!result.error) {
                render(status: 200, text: 'deleted')
            }
            else {
                response.status = 500
                render status:500, text:result.error
            }
        } else {
            response.status = 404
            render status:404, text: 'No such id'
        }
    }

    def linkUserToPerson(String id){
        log.debug "link user with id " + id
        Person person = Person.findByPersonId(id)
        log.debug "person to link is: " + person
        def props = request.JSON
        log.debug "props " + props
        personService.update(props, id)
    }


}
