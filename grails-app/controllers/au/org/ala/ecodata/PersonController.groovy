package au.org.ala.ecodata

class PersonController {

    PersonService personService

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    def index(Integer max) {
        params.max = Math.min(max ?: 10, 100)
        respond personService.list(params), model:[personCount: personService.count()]
    }

    def show(Long id) {
        respond personService.get(id)
    }

    @RequireApiKey
    def create() {
        respond new Person(params)
    }

    @RequireApiKey
    def save(Person person) {
        if (person == null) {
            notFound()
            return
        }

        personService.save(person)

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.created.message', args: [message(code: 'person.label', default: 'Person'), person.id])
                redirect person
            }
            '*' { respond person, [status: CREATED] }
        }
    }

    @RequireApiKey
    def edit(Long id) {
        respond personService.get(id)
    }

    @RequireApiKey
    def update(Person person) {
        if (person == null) {
            notFound()
            return
        }

        personService.save(person)


        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.updated.message', args: [message(code: 'person.label', default: 'Person'), person.id])
                redirect person
            }
            '*'{ respond person, [status: OK] }
        }
    }

    @RequireApiKey
    def delete(Long id) {
        if (id == null) {
            notFound()
            return
        }

        personService.delete(id)

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.deleted.message', args: [message(code: 'person.label', default: 'Person'), id])
                redirect action:"index", method:"GET"
            }
            '*'{ render status: NO_CONTENT }
        }
    }

}
