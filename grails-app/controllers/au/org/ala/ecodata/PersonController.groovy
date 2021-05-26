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
    UserService userService

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
        Map result = personService.update(id, props)
        render result as JSON
    }

    /**
     * When user creates a systematic site, add the site id to person.ownedSites 
     *
     * @param id of an existing person
     * @request contains the id of the created site 
     */    
    def addOwnedSite(String id) {
        Person person = personService.get(id)
        def request = request.JSON
        String siteId = request.siteId
        Map props = [:]
        if (person?.ownedSites){
            // check if the site is already saved for person
            if (!person.ownedSites.contains(siteId)){
                person.ownedSites.push(siteId)
            }
        } else {
            person.ownedSites = [siteId]
        }
        props = [ownedSites : person.ownedSites]
        
        personService.update(id, props)
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
        Person person 
        person = Person.findByUserId(id)
        String personStatus = "registeredVolunteer"
        List draftActivityForms = activityService.findDraftsForUserId(id)
        List projects = []
        List surveys = []
        List siteIds = personService.getSiteIdsForPerson(person)
        Map sites = [:]

        if (person) {
            if (siteIds){
                sites = siteService.getSitesForPersonBySiteId(siteIds)
            }
            List personProjects = person?.projects
            if (!personProjects.isEmpty()){

                try {
                    personProjects.each { projectId ->
                        def project = projectService.get(projectId, 'basic')
                        projects << project
                        def allSurveysForProject = projectActivityService.getAllByProject(projectId, 'brief')
                        allSurveysForProject.forEach {
                            it.projectName = project.name
                            surveys << it
                        }
                    }
                } catch (Exception MissingMethodException) {
                    personStatus = "Available projects are incorrectly saved."
                    // think this works but if not, it would be because of nested arrays, the solution is the comments
                    log.error "nested person.projects"
                } 

            } else {
                personStatus = "notMember"
            }
        } else {
            person = Person.findByEmail(params?.email)
            // if email address of user matches a person
            if (person){
                personStatus = "existingPerson"
            } else {
                personStatus = null
                log.debug "There is no one with this email address. The admin has to create a new person and link it to this user's ID"
            }
        }

        Map result = [
            personStatus: personStatus,
            person: person,
            siteStatus: sites?.message,
            sites: sites?.sites,
            projects: projects,
            surveys: surveys,
            drafts: draftActivityForms
        ]
        render result as JSON
    }

    def linkUserToPerson(){
        Map body = request.JSON
        Map props = [userId: body?.userId, hub: body?.hub]
        String internalPersonId = body?.internalPersonId
        List person = Person.findAllByInternalPersonId(internalPersonId)
        log.debug "person to link to user is: " + person + " with ID " + person.personId

        Map result

        if (person.size() == 1){
            if (person){
                result = personService.update(person[0].personId, props)
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

    def getPersonIdForUser(){
        String userId = params.userId
        def result = Person.findByUserId(userId)
        render result as JSON
    }

}
