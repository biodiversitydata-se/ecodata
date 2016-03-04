package au.org.ala.ecodata.reporting

import au.org.ala.ecodata.Report
import au.org.ala.ecodata.metadata.OutputMetadata
import au.org.ala.ecodata.metadata.OutputModelProcessor
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory
import pl.touk.excel.export.getters.PropertyGetter
import pl.touk.excel.export.multisheet.AdditionalSheet

/**
 * Exports project, site, activity and output data to a Excel spreadsheet.
 */
class ProjectXlsExporter extends ProjectExporter {

    static String DATE_CELL_FORMAT = "dd/mm/yyyy"
    static Log log = LogFactory.getLog(ProjectXlsExporter.class)

    List<String> projectHeaders = ['Project ID', 'Grant ID', 'External ID', 'Organisation', 'Service Provider', 'Name', 'Description', 'Program', 'Sub-program', 'Start Date', 'End Date', 'Funding', 'Status', 'Last Modified', 'State 1', 'State 2', 'State 3']
    List<String> projectProperties = ['projectId', 'grantId', 'externalId', 'organisationName', 'serviceProviderName', 'name', 'description', 'associatedProgram', 'associatedSubProgram', 'plannedStartDate', 'plannedEndDate', 'funding', 'status', 'lastUpdated', 'state0', 'state1', 'state2']

    List<String> siteHeaders = ['Site ID', 'Name', 'Description', 'lat', 'lon', 'State', 'NRM', 'Electorate', 'Last Modified']
    List<String> siteProperties = ['siteId', 'name', 'description', 'lat', 'lon', 'state', 'nrm', 'elect', 'lastUpdated']
    List<String> commonActivityHeaders = ['Project ID', 'Grant ID', 'External ID', 'Programme', 'Sub-Programme', 'Activity ID', 'Site ID', 'Planned Start date', 'Planned End date', 'Stage', 'Description', 'Activity Type', 'Theme', 'Status', 'Report Status', 'Last Modified']
    List<String> activityProperties = ['projectId', 'grantId', 'externalId', 'associatedProgram', 'associatedSubProgram', 'activityId', 'siteId', 'plannedStartDate', 'plannedEndDate', 'stage', 'description', 'type', 'mainTheme', 'progress', 'publicationStatus', 'lastUpdated']
    List<String> outputTargetHeaders = ['Project ID', 'Output Target Measure', 'Target', 'Units']
    List<String> outputTargetProperties = ['projectId', 'scoreLabel', new StringToDoublePropertyGetter('target'), 'units']
    List<String> risksAndThreatsHeaders = projectHeaders + ['Type of threat / risk', 'Description', 'Likelihood', 'Consequence', 'Risk rating', 'Current control', 'Residual risk']
    List<String> risksAndThreatsProperties = projectProperties + ['threat', 'description', 'likelihood', 'consequence', 'riskRating', 'currentControl', 'residualRisk']
    List<String> budgetHeaders = projectHeaders + ['Investment / Priority Area', 'Description', '2011/2012', '2012/2013', '2013/2014', '2014/2015', '2015/2016', '2016/2017', '2017/2018', '2018/2019', '2019/2020']
    List<String> budgetProperties = projectProperties + ['investmentArea', 'budgetDescription',  '2011/2012', '2012/2013', '2013/2014', '2014/2015', '2015/2016', '2016/2017', '2017/2018', '2018/2019', '2019/2020']
    List<String> assetsAddressed = ['Natural/Cultural assets managed','Threatened Species', 'Threatened Ecological Communities',
        'Migratory Species', 'Ramsar Wetland', 'World Heritage area', 'Community awareness/participation in NRM', 'Indigenous Cultural Values',
        'Indigenous Ecological Knowledge', 'Remnant Vegetation', 'Aquatic and Coastal systems including wetlands', 'Not Applicable']
    List<String> outcomesHeaders = projectHeaders + ['Outcomes'] + assetsAddressed
    List<String> outcomesProperties = projectProperties + ['outcomes'] + assetsAddressed
    List<String> monitoringHeaders = projectHeaders + ['Monitoring Indicators', 'Monitoring Approach']
    List<String> monitoringProperties = projectProperties + ['indicator','approach']
    List<String> projectPartnershipHeaders = projectHeaders + ['Partner name', 'Nature of partnership', 'Type of organisation']
    List<String> projectPartnershipProperties = projectHeaders + ['data1', 'data2', 'data3']
    List<String> projectImplementationHeaders = projectHeaders + ['Project implementation / delivery mechanism']
    List<String> projectImplementationProperties = projectProperties + ['implementation']
    List<String> keyEvaluationQuestionHeaders = projectHeaders + ['Project Key evaluation question (KEQ)', 'How will KEQ be monitored?']
    List<String> keyEvaluationQuestionProperties = projectProperties + ['data1', 'data2']
    List<String> prioritiesHeaders = projectHeaders + ['Document name', 'Relevant section', 'Explanation of strategic alignment']
    List<String> prioritiesProperties = projectProperties + ['data1', 'data2', 'data3']
    List<String> whsAndCaseStudyHeaders = projectHeaders + ['Are you aware of, and compliant with, your workplace health and safety legislation and obligations', 'Do you have appropriate policies and procedures in place that are commensurate with your project activities?', 'Are you willing for your project to be used as a case study by the Department?']
    List<String> whsAndCaseStudyProperties = projectProperties + ['obligations', 'policies', 'caseStudy']
    List<String> attachmentHeaders = projectHeaders + ['Title', 'Attribution', 'File name']
    List<String> attachmentProperties = projectProperties + ['name', 'attribution', 'filename']


    XlsExporter exporter

    Map<String, AdditionalSheet> sheets
    AdditionalSheet projectSheet
    AdditionalSheet sitesSheet
    AdditionalSheet outputTargetsSheet
    AdditionalSheet risksAndThreatsSheet
    AdditionalSheet budgetSheet


    List<String> tabsToExport

    Map<String, List<AdditionalSheet>> typedActivitySheets = [:]

    public ProjectXlsExporter(XlsExporter exporter, List<String> tabsToExport, String dateFormat = DATE_CELL_FORMAT) {
        this.exporter = exporter
        this.tabsToExport = tabsToExport
        this.sheets = new HashMap<String, AdditionalSheet>()
        exporter.setDateCellFormat(dateFormat)
    }

    public void export(Map project) {

        OutputModelProcessor processor = new OutputModelProcessor()
        Map activitiesModel = metadataService.activitiesModel()

        addProjectStates(project)

        exportProject(project)
        exportOutputTargets(project)
        exportSites(project)
        exportActivities(project, activitiesModel, processor)
        exportRisks(project)
        exportMeriPlan(project)
    }

    private addProjectStates(Map project) {
        List states = project.sites?.collect { it?.extent?.geometry?.state }?.findAll().unique()
        states.eachWithIndex { String state, int i ->
            String key = "state" + i
            project.put(key, state)
        }
    }

    private void exportActivities(Map project, activitiesModel, processor) {
        if (project.activities) {
            project.activities.each { activity ->

                if (tabsToExport && tabsToExport.contains(activity.type)) {
                    Map commonData = project + activity + [stage: getStage(activity, project)]
                    List activityData = []
                    List activityGetters = []

                    activityGetters += activityProperties

                    Map activityModel = activitiesModel.activities.find { it.name == activity.type }
                    if (activityModel) {
                        activityModel.outputs?.each { output ->
                            if (output != 'Photo Points') {
                                // This is legacy data which doesn't display in the spreadsheet
                                Map config = outputProperties(output)

                                activityGetters += config.propertyGetters

                                OutputMetadata outputModel = new OutputMetadata(metadataService.getOutputDataModelByName(output))
                                Map outputData = activity.outputs?.find { it.name == output }
                                if (outputData) {
                                    List flatData = processor.flatten(outputData, outputModel, false)
                                    flatData = flatData.collect { it + commonData }
                                    activityData += flatData
                                }
                            }
                        }
                        AdditionalSheet activitySheet = getActivitySheet(activityModel)
                        int activityRow = activitySheet.sheet.lastRowNum
                        activitySheet.add(activityData, activityGetters, activityRow + 1)

                    } else {
                        log.error("Found activity not in model: " + activity.type)
                    }
                }
            }
        }
    }

    private void exportSites(Map project) {
        if (tabsToExport && tabsToExport.contains('Sites')) {
            sitesSheet()
            if (project.sites) {
                def sites = project.sites.collect {
                    def centre = it.extent?.geometry?.centre
                    Map props = it.extent?.geometry ?: [:]
                    [siteId: it.siteId, name: it.name, description: it.description, lat: centre ? centre[1] : "", lon: centre ? centre[0] : "", lastUpdated: it.lastUpdated] + props
                }
                int row = sitesSheet.getSheet().lastRowNum
                sitesSheet.add(sites, siteProperties, row + 1)
            }
        }
    }

    private void exportOutputTargets(Map project) {
        if (tabsToExport && tabsToExport.contains('Output Targets')) {
            outputTargetsSheet()
            if (project.outputTargets) {
                List nonZeroTargets = project.outputTargets.findAll { it.scoreLabel && it.target && it.target != "0" }
                List targets = nonZeroTargets.collect { [projectId: project.projectId] << it }
                int row = outputTargetsSheet.getSheet().lastRowNum
                outputTargetsSheet.add(targets, outputTargetProperties, row + 1)
            }
        }
    }

    private void exportProject(Map project) {
        if (tabsToExport && tabsToExport.contains('Projects')) {
            projectSheet()
            int row = projectSheet.getSheet().lastRowNum

            List properties = new ArrayList(projectProperties)

            projectSheet.add([project], properties, row + 1)
        }
    }

    private void exportMeriPlan(Map project) {

        exportBudget(project)
        exportOutcomes(project)
        exportMonitoring(project)
        exportProjectPartnerships(project)
        exportProjectImplementation(project)
        exportKeyEvaluationQuestion(project)
        exportPriorities(project)
        exportWHSAndCaseStudy(project)
        exportAttachments(project)

    }

    private void exportBudget(Map project) {
        if (tabsToExport && tabsToExport.contains("Budget")) {
            budgetSheet()
            int row = budgetSheet.getSheet().lastRowNum

            List financialYears = project?.custom?.details?.budget?.headers?.collect {it.data}
            List data = project?.custom?.details?.budget?.rows?.collect { Map lineItem ->

                Map budgetLineItem = [
                        investmentArea: lineItem.shortDescription,
                        budgetDescription: lineItem.description
                ]
                budgetLineItem.putAll(project)
                financialYears.eachWithIndex { String year, int i ->
                    budgetLineItem.put(year, lineItem.costs[i].dollar)
                }

                budgetLineItem
            }

            budgetSheet.add(data?:[], budgetProperties, row+1)
        }

    }



    private void exportOutcomes(Map project) {
        if (shouldExport("Outcomes")) {
            AdditionalSheet sheet = getSheet("Outcomes", outcomesHeaders)
            int row = sheet.getSheet().lastRowNum


            List data = project?.custom?.details?.objectives?.rows1?.collect { Map objective ->

                Map objectivesItem = [
                        outcomes: objective.description
                ]
                objectivesItem.putAll(project)
                outcomesHeaders.each { String asset ->
                    if (objective.assets?.contains(asset)) {
                        objectivesItem[asset] = 'Y'
                    }
                    else {
                        objectivesItem[asset] = 'N'
                    }
                }

                objectivesItem
            }

            sheet.add(data?:[], outcomesProperties, row+1)
        }

    }

    private void exportMonitoring(Map project) {
        if (shouldExport("Monitoring")) {
            AdditionalSheet sheet = getSheet("Monitoring", monitoringHeaders)
            int row = sheet.getSheet().lastRowNum


            List data = project?.custom?.details?.objectives?.rows?.collect { Map monitoringLine ->

                Map monitoringItem = [
                        indicator: monitoringLine.data1,
                        approach: monitoringLine.data2
                ]
                monitoringItem.putAll(project)
                monitoringItem
            }

            sheet.add(data?:[], monitoringProperties, row+1)
        }

    }

    private void exportList(String tab, Map project, List data, List headers, List properties) {
        if (shouldExport(tab) && data) {
            AdditionalSheet sheet = getSheet(tab, headers)
            int row = sheet.getSheet().lastRowNum
            List augmentedList = data?.collect {
                it.putAll(project)
                it
            }
            sheet.add(augmentedList, properties, row+1)
        }
    }

    private void exportProjectPartnerships(Map project) {

        exportList("Project Partnerships", project, project?.custom?.details?.partnership?.rows,
                projectPartnershipHeaders, projectPartnershipProperties)
    }

    private void exportProjectImplementation(Map project) {
        if (shouldExport("Project Implementation")) {
            AdditionalSheet sheet = getSheet("Project Implementation", projectImplementationHeaders)
            int row = sheet.getSheet().lastRowNum

            if (project?.custom?.details?.implementation) {
                Map data = [implementation:project?.custom?.details?.implementation?.description]
                data.putAll(project)

                sheet.add(data, projectImplementationProperties, row+1)
            }
        }

    }

    private void exportKeyEvaluationQuestion(Map project) {
        exportList("Key Evaluation Question", project, project?.custom?.details?.keq?.rows,
                keyEvaluationQuestionHeaders, keyEvaluationQuestionProperties)
    }

    private void exportPriorities(Map project) {
        exportList("Priorities", project, project?.custom?.details?.priorities?.rows,
            prioritiesHeaders, prioritiesProperties)
    }

    private void exportWHSAndCaseStudy(Map project) {
        if (shouldExport("WHS and Case Study")) {
            AdditionalSheet sheet = getSheet("WHS and Case Study", whsAndCaseStudyHeaders)
            int row = sheet.getSheet().lastRowNum

            if (project?.custom?.details) {
                Map data = project?.custom?.details
                data.putAll(project)

                sheet.add(data, whsAndCaseStudyProperties, row + 1)
            }
        }
    }

    private void exportRisks(Map project) {
        if (tabsToExport && tabsToExport.contains('Risks and Threats')) {
            risksAndThreatsSheet()
            int row = risksAndThreatsSheet.getSheet().lastRowNum
            if (project.risks && project.risks.rows) {
                List data = project.risks.rows.collect { it + project }
                risksAndThreatsSheet.add(data, risksAndThreatsProperties, row + 1)
            }

        }
    }

    private void exportAttachments(Map project) {
        List meriPlanAttachments = project.documents?.findAll {it.role == "programmeLogic"}
        exportList("Attachments", project, meriPlanAttachments, attachmentHeaders, attachmentProperties)
    }

    String getStage(Map activity, project) {
        Date activityEndDate = activity.plannedEndDate

        if (!activityEndDate) {
            log.error("No end date for activity: ${activity.activityId}, project: ${project.projectId}")
            return ''
        }

        Report report = project.reports?.find { it.fromDate.getTime() < activityEndDate.getTime() && it.toDate.getTime() >= activityEndDate.getTime() }

        report ? report.name : ''
    }

    AdditionalSheet getActivitySheet(Map activityModel) {
        String activityType = activityModel.name
        if (!typedActivitySheets[activityType]) {
            List<String> headers = buildActivityHeaders(activityModel)
            typedActivitySheets[activityType] = exporter.addSheet(activityType, headers)
        }
        typedActivitySheets[activityType]
    }

    List<String> buildActivityHeaders(Map activityModel) {
        List<String> activityHeaders = [] + commonActivityHeaders

        activityModel.outputs?.each { output ->
            Map config = outputProperties(output)
            activityHeaders += config.headers
        }

        activityHeaders
    }

    AdditionalSheet projectSheet() {
        if (!projectSheet) {
            projectSheet = exporter.addSheet('Projects', projectHeaders)
        }
        projectSheet
    }

    AdditionalSheet sitesSheet() {
        if (!sitesSheet) {
            sitesSheet = exporter.addSheet('Sites', siteHeaders)
        }
        sitesSheet
    }

    AdditionalSheet outputTargetsSheet() {
        if (!outputTargetsSheet) {
            outputTargetsSheet = exporter.addSheet('Output Targets', outputTargetHeaders)
        }
        outputTargetsSheet
    }

    AdditionalSheet risksAndThreatsSheet() {
        if (!risksAndThreatsSheet) {
            risksAndThreatsSheet = exporter.addSheet('Risks and Threats', risksAndThreatsHeaders)
        }
        risksAndThreatsSheet
    }

    AdditionalSheet budgetSheet() {
        if (!budgetSheet) {
            budgetSheet = exporter.addSheet('Budget', budgetHeaders)
        }
        budgetSheet
    }

    boolean shouldExport(String sheetName) {
        return !tabsToExport || tabsToExport.contains(sheetName)
    }

    AdditionalSheet getSheet(String name, headers) {
        if (!sheets[name]) {
            sheets[name] = exporter.addSheet(name, headers)
        }
        sheets[name]
    }

    class StringToDoublePropertyGetter extends PropertyGetter<Object, Number> {

        StringToDoublePropertyGetter(String propertyName) {
            super(propertyName)
        }

        @Override
        protected format(Object value) {
            try {
                return Double.parseDouble(value?.toString())
            }
            catch (NumberFormatException e) {
                return null
            }
        }
    }
}
