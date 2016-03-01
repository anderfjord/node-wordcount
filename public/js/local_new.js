var Nordcounter = {

    API_BASE_URL: '/',

    recentRequests: [],

    currentNWords: 10,

    currentView: 'freeform',

    pollInterval: 2000,

    progressBarInterval: null,

    progressBarUpdateInterval: 200,

    DOM: {},

    load: function ($, DOM) {
        this.$ = $;
        this.DOM = DOM;
        this.loadClickHandlers();
        this.loadUserInterface()
    },

    loadUserInterface: function () {
        // 
        this.DOM.nWordsContainers.html(this.currentNWords);

        // 
        this.DOM.freeformText.focus();

        // Reveal the full UI to JavaScript users
        this.DOM.jsOnly.show();
    },

    loadClickHandlers: function () {

        var self = this;
        
        // Show the freeform text entry interface
        self.DOM.modeButtonFreeform.click(function () { self.showEntryView('freeform'); });

        // Show the file upload interface
        self.DOM.modeButtonUpload.click(function () { self.showEntryView('upload'); });

        // Submit text or file upload for counting
        self.DOM.submitTextButton.click(function () {
            switch (self.currentView) {
                case 'upload':      self.uploadTextFile();   break;
                case 'freeform':    self.submitText();       break;
                default:            self.submitText();       break;
            }
        });

        // Switch between text entry and recent requests within the input view
        self.DOM.inputViewTabs.click(function (e) {
            e.preventDefault();
            var viewTarget = self.$(this).attr('data-view-target');
            switch (viewTarget) {
                case 'text-input-view':
                    $('#my-requests-tab').removeClass('active');
                    $('#text-input-tab').addClass('active');
                    $('#my-requests-view').hide();
                    $('#input-view').show();
                    break;

                case 'my-requests-view':
                default:
                    $('#text-input-tab').removeClass('active');
                    $('#my-requests-tab').addClass('active');
                    $('#input-view').hide();
                    $('#my-requests-view').show();
                    break;
            }
        });

        // Switch between graph and raw data within the results view
        self.DOM.resultsViewTabs.click(function (e) {
            e.preventDefault();
            var viewTarget = self.$(this).attr('data-view-target');
            switch (viewTarget) {
                case 'raw-results-view':
                    self.DOM.graphResultsTab.removeClass('active');
                    self.DOM.rawResultsTab.addClass('active');
                    self.DOM.graphResultsView.hide();
                    self.DOM.rawResultsView.show();
                    break;

                case 'graph-results-view':
                default:
                    self.DOM.rawResultsTab.removeClass('active');
                    self.DOM.graphResultsTab.addClass('active');
                    self.DOM.rawResultsView.hide();
                    self.DOM.graphResultsView.show();
                    break;
            }
        });

        // Submit another count request following successful result
        self.$('button', self.DOM.resultsViewContainer).click(function () {
            self.DOM.freeformText.val('');
            self.showInputView();
        });

        // Show the about modal
        self.$('#about').click(function () {
            self.DOM.aboutModal.modal('show');
        });
    },

    clearProgressBar: function () {
        if (this.progressBarInterval) {
            clearInterval(this.progressBarInterval);
        }
        this.DOM.progressBar.attr('aria-valuenow', 0);
        this.DOM.progressBar.css('width', '0');
    },

    clearDisplayedRequestId: function () {
        this.DOM.requestIdDisplay.html('');
    },

    // Show the specified input entry view
    showEntryView: function (type) {
        switch (type) {
            case 'upload':
                this.currentView = 'upload';
                this.DOM.modeButtonFreeform.removeClass('active');
                this.DOM.modeButtonUpload.addClass('active');
                this.DOM.freeformTextContainer.hide();
                this.DOM.uploadTextContainer.show();
                break;
            case 'freeform':
            default:
                this.currentView = 'freeform';
                this.DOM.modeButtonUpload.removeClass('active');
                this.DOM.modeButtonFreeform.addClass('active');
                this.DOM.uploadTextContainer.hide();
                this.DOM.freeformTextContainer.show();
                break;
        }
    },

    // Show the text input view
    showInputView: function () {
        this.clearDisplayedRequestId();
        this.DOM.resultsViewContainer.hide();
        this.DOM.inProgressViewContainer.hide();
        this.DOM.inputViewContainer.show();
    },

    // Show the in-progress view
    showInProgressView: function () {
        this.DOM.inputViewContainer.hide();
        this.DOM.resultsViewContainer.hide();
        this.DOM.inProgressViewContainer.show();

        // Start animating progress bar
        var self = this
          , progressNum = 0;

        this.progressBarInterval = setInterval(function () {
            progressNum += 10;
            self.DOM.progressBar.attr('aria-valuenow', progressNum);
            self.DOM.progressBar.css('width', '' + progressNum + '%');

            if (progressNum >= 100) {
                self.clearProgressBar();
            }
        }, self.progressBarUpdateInterval);
    },

    // Show the results view
    showResultsView: function (data) {
        this.clearProgressBar();
        this.DOM.inputViewContainer.hide();
        this.DOM.inProgressViewContainer.hide();

        this.DOM.resultsGraph.html(''); // Clear out the graph each time before we display results

        var word
          , words = []
          , counts = []
          , colors = []
          , maxCount = 0;

        for (word in data.finalCounts) {
            words.push(word);
            counts.push(data.finalCounts[word]);
            colors.push('#99C19E');

            if (maxCount < data.finalCounts[word]) {
                maxCount = data.finalCounts[word];
            }
        }

        var graphDefinition = {
            selector: '#results-graph', 
            categories: words, 
            values: counts, 
            colors: colors,
            width: 900,
            height: 500,
            xMax: maxCount,
            xMin: 0
        };

        nGraph.create(graphDefinition);

        this.DOM.rawResultsView.hide()
        
        this.$('pre', this.DOM.rawResultsView).html(JSON.stringify(data, null, 2));

        this.DOM.resultsViewContainer.show();
    },

    // Poll for results
    pollForResults: function (requestId) {
        var self = this;
        var poll = setInterval(function () {
            self.$.ajax({
                type: 'GET',
                url: self.API_BASE_URL + 'results/' + requestId,
                dataType: 'json',
                success: function (data) {
                    if (data.status === 'completed') {
                        clearInterval(poll); // Stop polling
                        self.showResultsView(data);
                    } else {
                        // @TODO - update status/progress indicator
                        console.log('Keep going...');
                    }
                },
                error: function () {
                    alert('An error occurred while retrieving results. Please try again.');
                    self.showInputView();
                    clearInterval(poll); // Stop polling
                }
            });
        }, self.pollInterval);
    },

    // Upload a text file to the API
    uploadTextFile: function () {
        
    },

    // Submit freeform text to the API
    submitText: function () {

        var self = this
          , text = self.DOM.freeformText.val();

        if (typeof text !== 'string' || text.length < 1) {
            alert('Please enter some text');
            return;
        }

        // Always clear out any previous request ids being displayed
        self.clearDisplayedRequestId();

        // Queue the text for counting
        self.$.ajax({
            type: 'POST',
            url: self.API_BASE_URL + 'queue',
            dataType: 'json',
            data: {text: text},
            success: function (data) {
                // Store all recent requests in memory
                self.recentRequests.push(data.requestId);
                
                // Display the current request id
                self.DOM.requestIdDisplay.html(data.requestId);
                
                // Swith to "in progress" view
                self.showInProgressView(); 
                
                // Start polling for count results
                self.pollForResults(data.requestId);
            },
            error: function () {
                alert('An error occurred during text submission. Please try again.');
            }
        });
    },


    
};

jQuery(document).ready(function ($) {

    Nordcounter.load($, {
        jsOnly: $('.js-only'),
        nWordsContainers: $('.n-words'),
        requestIdDisplay: $('.request-id'),
        aboutModal: $('#aboutModal'),
        inputViewContainer: $('#input-view-container'),
        inputViewTabs: $('#input-tabs li'),
        modeButtonFreeform: $('#input-mode-controller button:nth-child(1)'),
        modeButtonUpload: $('#input-mode-controller button:nth-child(2)'),
        freeformTextContainer: $('#freeform-text-container'),
        freeformText: $('#freeform-text-container textarea'),
        uploadTextContainer: $('#upload-text-container'),
        submitTextButton: $('#submit-counts'),
        inProgressViewContainer: $('#in-progress-view-container'),
        progressBar: $('#in-progress-view-container .progress-bar'),
        resultsViewContainer: $('#results-view-container'),
        resultsViewTabs: $('#results-tabs li'),
        rawResultsTab: $('#raw-results-tab'),
        rawResultsView: $('#raw-results-view'),
        graphResultsTab: $('#graph-results-tab'),
        graphResultsView: $('#graph-results-view'),
        resultsGraph: $('#results-graph')
    });
    
});

