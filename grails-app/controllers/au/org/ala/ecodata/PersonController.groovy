package au.org.ala.ecodata

import grails.converters.JSON

import com.mongodb.*
import org.grails.datastore.mapping.mongo.MongoSession

/**
* For systematic monitoring - volunteer management 
*/

class PersonController {

    PersonService personService
    SiteService siteService
    ProjectActivityService projectActivityService
    ProjectService projectService

    /**
     * Get personal details of a member of a project 
     *
     * @param id - of an existing person
     * @return result - map containing personal details of the member
     */
    def get(String id) {
        def result = personService.get(id)
        render result as JSON
    }

    // def list(String projectId) {

    //     def list = []
    //     def persons = Person.list()
    //         // TODO should be findByProject(params.project) or something but person doesn't store projectId now
    //     persons.each { person ->
    //         list << person
    //     }
    //     list.sort {it.lastName}
    //     def result = [data: list] 

    //     render result as JSON
    // }

    /**
     * Create a new member of the project (person, not registered online)
     *
     * @props map containing personal details entered in a web form
     */
    // @RequireApiKey
    def create() {
        def props = request.JSON
        Map result = personService.create(props);
        render result as JSON
    }

    /**
     * Update personal details of a member of a project 
     *
     * @param id of an existing person
     * @props map containing personal details entered in a web form
     */
    // @RequireApiKey
    def update(String id) {
        def props = request.JSON
        Map result = personService.update(props, id)
        render result as JSON
    }

    /**
     * Delete a member of a project 
     *
     * @param id - of the person to be deleted
     * @return 
     */
    // @RequireApiKey
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

    /**
     * Link a user registered in CAS to person entered previously by the admin
     * This is done when an existing person first registers in CAS 
     *
     * @param id - of the person to be linked
     * @return 
     */
    def linkUserToPerson(String id){
        log.debug "link user with id " + id
        Person person = Person.findByPersonId(id)
        log.debug "person to link is: " + person
        def props = request.JSON
        personService.update(props, id)
    }

    /**
     * Search for a person by email address and/ or name
     * This is done when an existing person first registers in CAS 
     *
     * @param params - contain a string search term which can be a mixture of email and name 
     * @return <List>result - a list of persons who match the search criteria
     */
    def searchPerson() {
        def searchTerm = params.search
        List result = Person.search(searchTerm)
        render result as JSON
    }

    def getDataForPersonHomepage(String id){
        def person = Person.findByUserId(id)
        String personStatus = "ok"
        String personId = person.personId
        def projects = []
        def surveys = []
        def sites = []
        if (personId == null){
            personStatus = "You are not registered for any projects. Please contact the project administrator to link your account to a project"
        } else {
            sites = siteService.getSitesForPerson(personId)
            List personProjects = person?.projects
            personProjects.each { project ->
                projects << projectService.get(project, 'basic')
                surveys << projectActivityService.getAllByProject(project, 'docs')
            }
        }
        log.debug "projects" +projects
        log.debug "surveys " +surveys
        Map result = [
            personStatus: personStatus,
            person: person,
            siteStatus: sites?.message,
            sites: sites?.sites,
            projects: projects,
            surveys: surveys
        ]

        log.debug result
        render result as JSON
    }

}
