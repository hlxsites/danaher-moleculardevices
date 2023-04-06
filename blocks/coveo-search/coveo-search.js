import { loadScript } from '../../scripts/scripts.js';

const coveoAdminId = 'kapil.dhiman@moldev.com';
const organizationId = 'moleculardevicesproductionca45f5xc';
const coveoToken = 'xx7ccd389f-e787-4ff7-ac4a-33d62f7a74af';

const coveoStyle = document.createElement('link');
coveoStyle.rel = 'stylesheet';
coveoStyle.type = 'text/css';
coveoStyle.href = 'https://static.cloud.coveo.com/searchui/v2.10104/css/CoveoFullSearch.min.css';
document.getElementsByTagName('HEAD')[0].appendChild(coveoStyle);

loadScript('https://static.cloud.coveo.com/searchui/v2.10104/js/CoveoJsSearch.Lazy.min.js');
loadScript('https://static.cloud.coveo.com/searchui/v2.10104/js/templates/templates.js');

function searchForm() {
  return `
          <div id="search" class="CoveoSearchInterface mdcoveo" data-enable-history="true" data-excerpt-length="350">
            <div class="CoveoFolding"></div>
            <div class="CoveoAnalytics"></div>
            <div class="section cover-banner-wrapper">
              <div class="cover-banner">
                <div class="cover-banner-content">
                  <h1>Welcome to Resource Hub</h1>
                  <h3>HOW CAN WE HELP YOU TODAY?</h3>
                </div>
                <div class="not-fixed-search">
                  <div class="coveo-search-section">
                    <div class="CoveoSearchbox" data-enable-omnibox="true" data-enable-search-as-you-type="true" data-number-of-suggestions="5" data-partial-match-keywords="" data-enable-partial-match="true" data-inline="true" data-placeholder="" data-enable-query-suggest-addon="true"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="section coveo-tab-section-wrapper">
              <div class="coveo-tab-section">
                <a class="CoveoTab" data-id="All" data-caption="All Content" data-expression="@source==&quot;Molecular Devices Website&quot; OR @source==&quot;Molecular Devices Support Portal&quot;"></a>
                <div class="CoveoTab" data-id="Resources" data-caption="Resources" data-expression="@source==&quot;Molecular Devices Website&quot; AND @md_pagetype==Resource AND NOT @md_contenttype==CoA AND NOT @md_contenttype==SDS AND NOT @md_contenttype==SDS">
                </div>
                <div class="CoveoTab" data-id="Videos" data-caption="Videos" data-expression="@source==&quot;Molecular Devices Website&quot; AND @md_contenttype==&quot;Videos &amp; Webinars&quot;">
                </div>
                <div class="CoveoTab" data-id="KBArticles" data-caption="Knowledge Base" data-expression="@source==&quot;Molecular Devices Support Portal&quot;"></div>
                <div class="CoveoTab" data-id="CoA" data-caption="CoA" data-expression="@source==&quot;Molecular Devices Website&quot; AND @md_contenttype==CoA"></div>
                <div class="CoveoTab" data-id="SDS" data-caption="SDS" data-expression="@source==&quot;Molecular Devices Website&quot; AND @md_contenttype==SDS"></div>
              </div>
            </div>
            <div class="section coveo-main-section-wrapper">
              <div class="coveo-main-section">
                <p class='coveoMainTitle'></p>
                <div class="coveo-facet-column" style="width:254.062px">
                  <div class="CoveoDynamicFacet" data-enable-scroll-to-top="false" data-title="Country" data-field="@md_country" data-tab="SDS" data-id="Country" data-number-of-values="" data-enable-facet-search="false"></div>
                  <div class="CoveoDynamicHierarchicalFacet" data-enable-facet-search="false" data-delimiting-character="|" data-title="Products" data-field="@mdproductsdatacategory" data-tab="Products, All, Resources, KBArticles, Videos" data-number-of-values="8" data-enable-collapse="true" data-enable-scroll-to-top="false" data-filter-facet-count="false"></div>
                  <div class="CoveoDynamicFacet" data-enable-scroll-to-top="false" data-title="Languages" data-field="@md_lang" data-tab="SDS" data-number-of-values="" data-depends-on="Country"></div>
                  <div class="CoveoDynamicFacet" data-enable-scroll-to-top="false" data-title="Type" data-field="@objecttype" data-tab="Resources"></div>
                  <div class="CoveoDynamicFacet" data-enable-scroll-to-top="false" data-title="Content Type" data-enable-facet-search="false" data-field="@md_contenttype" data-number-of-values="8" data-tab="Resources, All"></div>
                  <div class="CoveoDynamicFacet" data-enable-scroll-to-top="false" data-enable-facet-search="false" data-title="Article Type" data-field="@mdarticletypedatacategory" data-number-of-values="8" data-tab="All, SalesforceArticle"></div>
                  <div class="CoveoDynamicFacet" data-enable-scroll-to-top="false" data-title="Content Type 2" data-field="@pagetype" data-tab="Resources"></div>
                </div>
                <div class="coveo-results-column">
                  <div class="CoveoShareQuery"></div>
                  <div class="CoveoPreferencesPanel">
                    <div class="CoveoResultsPreferences"></div>
                    <div class="CoveoResultsFiltersPreferences"></div>
                  </div>
                  <div class="CoveoTriggers"></div>
                  <div class="CoveoBreadcrumb"></div>
                  <div class="CoveoDidYouMean"></div>
                  <div class="coveo-results-header">
                    <div class="coveo-summary-section">
                      <span class="CoveoQuerySummary">
                        <div class="coveo-show-if-no-results"></div>
                      </span>
                      <span class="CoveoQueryDuration"></span>
                    </div>
                    <div class="coveo-result-layout-section">
                      <span class="CoveoResultLayout"></span>
                    </div>
                    <div class="coveo-sort-section">
                      <span class="CoveoSort" data-sort-criteria="relevancy" data-caption="Relevance"></span>
                      <span class="CoveoSort" data-sort-criteria="date descending,date ascending" data-caption="Date"></span>
                    </div>
                  </div>
                  <div class="CoveoHiddenQuery"></div>
                  <div class="CoveoErrorReport" data-pop-up="false"></div>
                  <div class="CoveoResultList" data-layout="list" data-wait-animation="fade" data-auto-select-fields-to-include="false">
                    <script id="SalesforceKnowledgeArticle" class="result-template" type="text/html" data-field-sfknowledgearticleid="">
                          <div class="coveo-result-frame" style="padding: 0 16px 16px 0;">
                            <div class="coveo-result-cell" style="width:100px">
                              <span class="CoveoIcon" data-small="true"></span>
                            </div>
                            <div class="coveo-result-cell" style="vertical-align: top; padding-left: 16px;">
                              <div class="coveo-result-row" style="margin-top: 0;">
                                <div class="coveo-result-cell" style="vertical-align: top; font-size: 16px;">
                                  <a class="CoveoResultLink"  data-href-template="https://support.moleculardevices.com/s/article/" target="_blank"> </a>
                                </div>
                                <div class="coveo-result-cell" style="width: 120px; text-align: right; font-size: 12px;">
                                  <div class="coveo-result-row">
                                    <span class="CoveoFieldValue" data-field="@sflastmodifieddate" data-helper="date"></span>
                                  </div>
                                </div>
                              </div>
                              <div class="CoveoConditionalRendering" id="ExcerptConditionalRendering">
                          <div class="coveo-result-row" style="margin-top:1px;">
                          <div class="coveo-result-cell">
                          <span class="CoveoFieldValue" data-helper="shorten" data-helper-options-length="200" data-field="@sfquestion__c" data-html-value="true"></span>
                          <span class="CoveoExcerpt"></span>
                          </div>
                          </div>
                          </div>
                              <div class="coveo-result-row" style="margin-top: 8px;">
                                <div class="coveo-result-cell" style="line-height: 1.5em;">
                                  <span class="CoveoFieldValue" data-field="@sfownername" data-text-caption="Owner" style="margin-right: 30px;"></span>
                                  <span class="CoveoFieldValue" data-field="@sfarticletype" data-text-caption="Type" style="margin-right: 30px;"></span>
                                </div>
                              </div>
                            </div>
                          </div>
                          </div>
                      </script>
                    <script id="Default" class="result-template" type="text/html" data-layout="list">
                          <div class="coveo-result-frame">
                            <div class="coveo-result-cell" >
                              <span class="CoveoIcon" data-small="true"  data-with-label="false" data-field="@md_img"  data-condition-field-not-md_img=""></span>
                              <table class="CoveoFieldTable" data-expanded-title="Type"></table>
                              <span class="CoveoFieldValue product_img" data-field="@md_img" data-helper="image" data-html-value="true"></span>
                            </div>
                            <div class="coveo-result-cell" style="vertical-align: top;padding-left: 16px;">
                              <div class="coveo-result-row" style="margin-top:0;">
                                <div class="coveo-result-cell" style="vertical-align:top;font-size:16px;" role="heading" aria-level="2">
                                  <a class="CoveoResultLink" target="_blank"><span class="CoveoFieldValue" data-field="@md_title"> <span class="CoveoFieldValue" data-field="@title" data-condition-field-not-md_title=""></span></span></a>
                                </div>
                                <div class="coveo-result-cell" style="width:120px;text-align:right;font-size:12px">
                                  <div class="coveo-result-row">
                                    <span class="CoveoFieldValue" data-field="@date" data-helper="date"></span>
                                  </div>
                                </div>
                              </div>
                              <div class="coveo-result-row" style="margin-top:10px;">
                                <div class="coveo-result-cell">
                                  <span class="CoveoExcerpt"></span>
                                </div>
                              </div>
                              <div class="coveo-result-row" style="margin-top:10px;">
                                <div class="coveo-result-cell">
                                  <span class="CoveoFieldValue" data-field="@md_rfq" data-html-value="true" data-helper="anchor" data-text-caption="" data-helper-options-text="Request Quote"></span>
                                </div>
                              </div>
                              <div class="coveo-result-row" style="margin-top:10px;">
                              </div>
                              <div class="coveo-result-row">
                                <div class="coveo-result-cell">
                                  <div class="CoveoMissingTerms"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                      </script>
                  </div>
                  <div class="CoveoPager"></div>
                  <div class="CoveoLogo" style="display: none;"></div>
                  <div class="CoveoResultsPerPage"></div>
                </div>
              </div>
            </div>
          </div>
        `;
}

async function coveoSearchInitiation(organizationID, accessToken) {
  /* global Coveo */
  Coveo.SearchEndpoint.configureCloudV2Endpoint(organizationID, accessToken);
  Coveo.init(document.getElementById('search'), {
    ExcerptConditionalRendering: {
      values: ['public'],
      compareValue: '{{ cp_cookie }}',
    },
  });
}

async function getCoveoToken() {
  const myHeaders = new Headers();
  myHeaders.append('accept', 'application/json');
  myHeaders.append('Authorization', `Bearer ${coveoToken}`);
  myHeaders.append('Content-Type', 'application/json');

  const raw = JSON.stringify({
    userIds: [
      {
        name: coveoAdminId,
        provider: 'Email Security Provider',
      },
    ],
    filter: '',
  });

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  await fetch(
    `https://platform.cloud.coveo.com/rest/search/v2/token?organizationId=${organizationId}`,
    requestOptions,
  )
    .then((response) => response.text())
    .then((responseData) => {
      coveoSearchInitiation(organizationId, JSON.parse(responseData).token);
    })
}

export default async function decorate() {
  document.querySelector('.coveo-search > div').innerHTML = searchForm();
  setTimeout(getCoveoToken, 500);
}
