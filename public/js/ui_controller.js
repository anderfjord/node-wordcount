/**
 * Custom controller for handling the relatively simple UI demands of this project
 */
var UiController = {

    $: null,

    DOM: {},

    API_BASE_URL: '/',

    currentView: 'freeform',

    recentRequests: [],

    pollInterval: 2000,

    progressBarInterval: null,

    progressBarUpdateInterval: 200,

    load: function ($, DOM) {
        var self = this;
        self.$ = $;
        self.DOM = DOM;
        self.loadClickHandlers();
        self.loadUserInterface()
    },

    loadUserInterface: function () {
        var self = this;
        self.DOM.jsOnly.show(); // Reveal the full UI to JavaScript users
        self.DOM.freeformText.focus();
    },

    loadClickHandlers: function () {
        var self = this;
        
        self.DOM.homeBtn.click(function (ev) {
            ev.preventDefault();
            self.DOM.freeformText.focus();
            self.showInputView();
        });

        // Show the freeform text entry interface
        self.DOM.modeBtnFreeform.click(function () {
            self.showEntryView('freeform');
        });

        // Show the file upload interface
        self.DOM.modeBtnUpload.click(function () {
            self.showEntryView('upload');
        });

        // Submit text or file upload for counting
        self.DOM.submitTextBtn.click(function () {
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
                    self.DOM.myRequestsTab.removeClass('active');
                    self.DOM.textInputTab.addClass('active');
                    self.DOM.myRequestsView.hide();
                    self.DOM.textInputView.show();
                    break;

                case 'my-requests-view':
                default:
                    self.DOM.textInputTab.removeClass('active');
                    self.DOM.myRequestsTab.addClass('active');
                    self.DOM.textInputView.hide();
                    self.DOM.myRequestsView.show();
                    break;
            }
        });

        // Switch between graph and raw data within the results view
        self.DOM.resultsViewTabs.click(function (ev) {
            ev.preventDefault();
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
        self.DOM.returnToInputViewBtn.click(function () {
            self.DOM.freeformText.val('');
            self.DOM.freeformText.focus();
            self.showInputView();
        });

        // Show the about modal
        self.DOM.aboutModalBtn.click(function () {
            self.DOM.aboutModal.modal('show');
        });
    },

    ajax: function (request) {
        var self = this;
        return self.$.ajax(request);
    },

    // Show the input view
    showInputView: function () {
        var self = this;
        self.clearDisplayedRequestId();
        self.DOM.resultsViewContainer.hide();
        self.DOM.inProgressViewContainer.hide();
        self.DOM.inputViewContainer.show();
    },

    // Show the specified input entry view
    showEntryView: function (type) {
        var self = this;
        switch (type) {
            case 'upload':
                self.currentView = 'upload';
                self.DOM.modeBtnFreeform.removeClass('active');
                self.DOM.modeBtnUpload.addClass('active');
                self.DOM.freeformTextContainer.hide();
                self.DOM.uploadTextContainer.show();
                break;
            case 'freeform':
            default:
                self.currentView = 'freeform';
                self.DOM.modeBtnUpload.removeClass('active');
                self.DOM.modeBtnFreeform.addClass('active');
                self.DOM.uploadTextContainer.hide();
                self.DOM.freeformTextContainer.show();
                break;
        }
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
        self.ajax({
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

    // Upload a text file to the API
    uploadTextFile: function () {
        var self = this;
    },

    // Show the in-progress view
    showInProgressView: function () {
        
        var self = this
          , progressNum = 0;

        self.DOM.inputViewContainer.hide();
        self.DOM.resultsViewContainer.hide();
        self.DOM.inProgressViewContainer.show();

        // Start animating the progress bar
        self.progressBarInterval = setInterval(function () {
            progressNum += 10;
            self.DOM.progressBar.attr('aria-valuenow', progressNum);
            self.DOM.progressBar.css('width', '' + progressNum + '%');

            if (progressNum >= 100) {
                self.clearProgressBar();
            }
        }, self.progressBarUpdateInterval);
    },

    clearProgressBar: function () {
        var self = this;
        if (self.progressBarInterval) {
            clearInterval(self.progressBarInterval);
        }
        self.DOM.progressBar.attr('aria-valuenow', 0);
        self.DOM.progressBar.css('width', '0');
    },

    clearDisplayedRequestId: function () {
        var self = this;
        self.DOM.requestIdDisplay.html('');
    },

    // Poll for results
    pollForResults: function (requestId) {
        var self = this;

        var poll = setInterval(function () {
            self.ajax({
                type: 'GET',
                url: self.API_BASE_URL + 'results/' + requestId,
                dataType: 'json',
                success: function (data) {
                    if (data.status === 'completed') {
                        clearInterval(poll); // Stop polling
                        self.showResultsView(data);
                    } else {
                        // @TODO - improve update of status/progress indicator for long-running counts
                        // console.log('Keep going...');
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

     // Show the results view
    showResultsView: function (data) {

        var self = this
          , word
          , words = []
          , counts = []
          , colors = []
          , maxCount = 0;

        self.clearProgressBar();

        self.DOM.inputViewContainer.hide();
        self.DOM.inProgressViewContainer.hide();
        self.DOM.resultsGraph.html(''); // Clear out the graph each time before we display results

        for (word in data.finalCounts) {
            words.push(word);
            counts.push(data.finalCounts[word]);
            colors.push('#99C19E');

            if (maxCount < data.finalCounts[word]) {
                maxCount = data.finalCounts[word];
            }
        }

        // Render the top words horizontal bar chart
        nGraph.create({
            selector: '#results-graph', 
            categories: words, 
            values: counts, 
            colors: colors,
            width: 900,
            height: 500,
            xMax: maxCount,
            xMin: 0
        });

        self.DOM.rawResultsView.hide()
        
        self.DOM.rawResultsViewContents.html(JSON.stringify(data, null, 2));

        self.DOM.resultsViewContainer.show();
    }
};