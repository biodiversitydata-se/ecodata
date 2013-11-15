package au.org.ala.ecodata
/**
 * Builds a JSON schema from a data model definition.
 * @link http://json-schema.org/
 */

class SchemaBuilder {

    /** Prefix for URLs generated for this schema */
    def urlPrefix


    public SchemaBuilder(urlPrefix, apiVersion) {
        this.urlPrefix = urlPrefix + '/ws/documentation/' +apiVersion
    }

    /**
     * Temp storage for properties that reference nested object structures.  Used to separate those structures into
     * references in the schema (instead of embedded/nested objects) to simplify producing the documentation
     */
    def referencedDefinitions = [:]

    def schemaForActivity(activity) {

        def allowedOutputs = activity.outputs.collect {[$ref:buildOutputRef(it)]}

        def schema = [
            id:"${urlPrefix}/activity/${activity.name.replace(' ', '%20')}.json#",
            $schema:'"http://json-schema.org/draft-04/schema#"',
            type:'object',
            properties: [
                projectExternalId:[type:'string', description:'Must match the externalId property of an existing project entity'],
                type:[enum:[activity.name], description: ''],
                plannedStartDate:dateProperty(null),
                plannedEndDate:dateProperty(null),
                startDate:dateProperty(null),
                endDate:dateProperty(null),
                mainTheme:textProperty(null),
                status:constrainedTextProperty([constraints:['planned','started','finished']]),
                outputs:[type:'array', items:[type:'object', anyOf:allowedOutputs]]
            ]
        ]

        schema
    }

    def buildOutputRef(outputName) {
        def encodedOutput = outputName.replace(' ', '%20')
        return "${urlPrefix}/output/${encodedOutput}.json#"
    }

    /**
     * This method is not threadsafe.
     * @param output
     * @return
     */
    def schemaForOutput(output) {

        def outputProperties = [:]
        outputProperties << [type:[enum:[output.modelName]]]
        outputProperties << [data:objectSchema(output.dataModel)]
        def schema = [id:"${urlPrefix}/output#", $schema:'"http://json-schema.org/draft-04/schema#"', type:'object', properties: outputProperties]

        def definitions = [:]

        referencedDefinitions.each { key, value ->
            definitions << [(key):objectSchema(value.columns)]
        }
        schema << [definitions:definitions]
        schema
    }

    def objectSchema(objectProps) {
        def properties = [:]
        objectProps.each {
            if (!it.computed) {  // TODO what to do about computed values?
                properties << [(it.name):generatorFor(it).schemaFor(it)]
            }
        }
        [type:'object', properties:properties]
    }


   PropertySchemaGenerator generatorFor(property) {
       if (property.constraints && property.dataType == 'text') {
           return new PropertySchemaGenerator(this.&constrainedTextProperty)
       }
       else {
           def typeGenerator
           switch (property.dataType) {
               case 'text':
                   typeGenerator = this.&textProperty
                   break
               case 'stringList':
                   typeGenerator = this.&stringListProperty
                   break
               case 'list':
                   typeGenerator = this.&listProperty
                   break
               case 'species':
                   typeGenerator = this.&speciesProperty
                   break
               case 'number':
                   typeGenerator = this.&numberProperty
                   break
               case 'date':
                   typeGenerator = this.&dateProperty
                   break
               default:
                   typeGenerator = this.&error
                   break
                   //throw new IllegalArgumentException("Unsupported dataType: ${property.dataType} for property: ${property}")
           }

           return new PropertySchemaGenerator(typeGenerator)
       }
   }

    class PropertySchemaGenerator {

        def typeSpecificProperties

        public PropertySchemaGenerator(Closure typeSpecificProperties) {
            this.typeSpecificProperties = typeSpecificProperties
        }

        def schemaFor(property) {
            def properties = [:]
            if (property.title) {
                properties << [title:property.title]
            }
            if (property.description) {
                properties << [description:property.description]
            }

            def extraProperties = typeSpecificProperties(property)
            properties.putAll(extraProperties)
            properties
        }
    }



    def textProperty(property) {
            return [type:'string']
    }

    def constrainedTextProperty(property) {
        return [enum:property.constraints]
    }

    def stringListProperty(property) {
        return [type:'array', items:[enum:property.constraints]]
    }

    def listProperty(property) {
        referencedDefinitions << [(property.name):property]
        return [type:'array', items:[type:'object', oneOf:[[$ref:"#/definitions/${property.name}"]]]]
    }

    def speciesProperty(property) {
        return [type:'object', properties:[name:[type:'string'], guid:[type:'string'], listId:[type:'string']]]
    }

    def numberProperty(property) {
        return [type:'number']
    }

    def dateProperty(property) {
        [type:'string', format:'date-time']
    }

    def error(property) {
        return [type:'unsupported']
    }
}