package au.org.ala.ecodata

class GormMongoUtil {

    static extractDboProperties(obj) {
        //obj.//getClass()
        //    .declaredFields
        //    .findAll { !it.synthetic }
        obj.collectEntries { field ->
            [field.key, field.value]
        }
    }
}
