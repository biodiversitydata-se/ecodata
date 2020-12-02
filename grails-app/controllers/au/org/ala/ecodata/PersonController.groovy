package au.org.ala.ecodata

import grails.converters.JSON

import com.mongodb.*
import org.grails.datastore.mapping.mongo.MongoSession

/**
* For systematic monitoring - volunteer management 
*/

class PersonController {

    PersonService personService
    ActivityService activityService
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
        def person = personService.get(id)
        Map activityCount = activityService.countActivitiesForPerson(id)
        Map result = [person: person, activityCount: activityCount]
        render result as JSON
    }

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
     * Search for a person by email address and/ or name
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
        String personId = person?.personId
        def projects = []
        def surveys = []
        def sites = []
        if (personId == null){
            personStatus = "Please contact the project administrator to link your account to a project. \
            No sites or records have been linked to your account"
            log.debug "This user's account is not linked to a person. The admin has to create a new person and link it to this user's ID"
        } else {
            sites = siteService.getSitesForPerson(personId, "homepage")
            List personProjects = person?.projects
            if (!personProjects.isEmpty()){
                // TODO - fix the format how projects are saved to get rid of the nested array then the try/ catch won't be necessary
                try {
                    personProjects.each { projectId ->
                        projects << projectService.get(projectId, 'basic')
                        surveys << projectActivityService.getAllByProject(projectId, 'docs')
                    }
                } catch (Exception MissingMethodException) {
                    personProjects[0].each { projectId ->
                        projects << projectService.get(projectId, 'basic')
                        surveys << projectActivityService.getAllByProject(projectId, 'docs')
                    }
                } 

            } else {
                personStatus = "This person has no projects assigned."
            }
        }
        Map result = [
            personStatus: personStatus,
            person: person,
            siteStatus: sites?.message,
            sites: sites?.sites,
            projects: projects,
            surveys: surveys
        ]
        render result as JSON
    }

    def linkUserToPerson(){
        Map body = request.JSON
        Map userId = [userId: body.userId]
        def internalPersonId = body.internalPersonId
        def person = Person.findAllByInternalPersonId(internalPersonId)

        Map result

        if (person.size() == 1){
            if (person){
                result = personService.update(userId, person.personId)
            } else {
                def error = "Failed to link person - no such internal id: ${internalPersonId}"
                log.error error
                result = [status:'notFound', internalPersonId:internalPersonId]
            }
        } else {
            def names = person.collect { 
                return it.firstName + ' ' + it.lastName 
                }
            result = [status:'foundMany', internalPersonId:internalPersonId, persons:names]
        }
        
        render result as JSON
    }

}
