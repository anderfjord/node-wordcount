/**
 * Inject significant DOM elements into controller on document load 
 */
jQuery(document).ready(function ($) {

    UiController.load($, {
        jsOnly: $('.js-only'),
        homeBtn: $('.home'),
        requestIdDisplay: $('.request-id'),
        aboutModalBtn: $('#about'),
        aboutModal: $('#aboutModal'),
        inputViewContainer: $('#input-view-container'),
        inputViewTabs: $('#input-tabs li'),
        modeBtnFreeform: $('#input-mode-controller button:nth-child(1)'),
        modeBtnUpload: $('#input-mode-controller button:nth-child(2)'),
        freeformTextContainer: $('#freeform-text-container'),
        freeformText: $('#freeform-text-container textarea'),
        uploadTextContainer: $('#upload-text-container'),
        uploadInput: $('input[type=file]'),
        submitTextBtn: $('#submit-counts'),
        textInputTab: $('#text-input-tab'),
        textInputView: $('#input-view'),
        myRequestsTab: $('#my-requests-tab'),
        myRequestsView: $('#my-requests-view'),
        inProgressViewContainer: $('#in-progress-view-container'),
        progressBar: $('#in-progress-view-container .progress-bar'),
        resultsViewContainer: $('#results-view-container'),
        resultsViewTabs: $('#results-tabs li'),
        rawResultsTab: $('#raw-results-tab'),
        rawResultsView: $('#raw-results-view'),
        rawResultsViewContents: $('#raw-results-view pre'),
        graphResultsTab: $('#graph-results-tab'),
        graphResultsView: $('#graph-results-view'),
        resultsGraph: $('#results-graph'),
        returnToInputViewBtn: $('#results-view-container button')
    });
    
});