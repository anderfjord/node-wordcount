jQuery(document).ready(function ($) {

    var API_BASE_URL = '/'
      , recentRequests = []
      , currentNWords = 10
      , currentView = 'freeform'
      , progressBarInterval;

    /**
     * Preload jQuery objects to avoid unecessary lookups
     */

    // Global elements
    var nWordsContainers = $('.n-words')
      , requestIdDisplay = $('.request-id')
      , aboutModal = $('#aboutModal')
      
    // Input View Elements
    var inputViewContainer = $('#input-view-container')
      , inputViewTabs = $('#input-tabs li')
      , inputTab = $('#text-input-tab')
      , inputView = $('#input-view')
      , myRequestsTab = $('#my-requests-tab')
      , myRequestsView = $('#my-requests-view')
      , modeButtonFreeform = $('#input-mode-controller button:nth-child(1)')
      , modeButtonUpload = $('#input-mode-controller button:nth-child(2)')
      , freeformTextContainer = $('#freeform-text-container')
      , freeformText = $('textarea', freeformTextContainer)
      , uploadTextContainer = $('#upload-text-container')
      , submitTextButton = $('#submit-counts');
      
    // In-Progress View Elements
    var inProgressViewContainer = $('#in-progress-view-container')
      , progressBar = $('.progress-bar', inProgressViewContainer);
      
    // Results View Elements
    var resultsViewContainer = $('#results-view-container')
      , resultsViewTabs = $('#results-tabs li')
      , rawResultsTab = $('#raw-results-tab')
      , rawResultsView = $('#raw-results-view')
      , graphResultsTab = $('#graph-results-tab')
      , graphResultsView = $('#graph-results-view')
      , resultsGraph = $('#results-graph');
      
    nWordsContainers.html(currentNWords);
    freeformText.focus();

    // Only reveal the action interface for JavaScript-enabled users.
    // This only happens once, so no need to preload the object.
    $('.js-only').show();

    /************************************************/

    // Clears the progress bar
    var clearProgressBar = function () {
        if (progressBarInterval) {
            clearInterval(progressBarInterval);
        }
        progressBar.attr('aria-valuenow', 0);
        progressBar.css('width', '0');
    };

    // Clear any displayed request ids
    var clearDisplayedRequestId = function () {
        requestIdDisplay.html('');
    };

    // Show the specified input entry view
    var showEntryView = function (type) {
        switch (type) {
            case 'upload':
                currentView = 'upload';
                modeButtonFreeform.removeClass('active');
                modeButtonUpload.addClass('active');
                freeformTextContainer.hide();
                uploadTextContainer.show();
                break;
            case 'freeform':
            default:
                currentView = 'freeform';
                modeButtonUpload.removeClass('active');
                modeButtonFreeform.addClass('active');
                uploadTextContainer.hide();
                freeformTextContainer.show();
                break;
        }
    };

    // Show the text input view
    var showInputView = function () {
        clearDisplayedRequestId();
        resultsViewContainer.hide();
        inProgressViewContainer.hide();
        inputViewContainer.show();
    };

    // Show the in-progress view
    var showInProgressView = function () {
        inputViewContainer.hide();
        resultsViewContainer.hide();
        inProgressViewContainer.show();

        // Start animating progress bar
        var progressNum = 0;
        progressBarInterval = setInterval(function () {
            progressNum += 10;
            progressBar.attr('aria-valuenow', progressNum);
            progressBar.css('width', '' + progressNum + '%');

            if (progressNum >= 100) {
                clearProgressBar();
            }
        }, 200);
    };

    // Show the results view
    var showResultsView = function (data) {
        clearProgressBar();
        inputViewContainer.hide();
        inProgressViewContainer.hide();

        resultsGraph.html(''); // Clear out the graph each time before we display results

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

        rawResultsView.hide()
        $('pre', rawResultsView).html(JSON.stringify(data, null, 2));

        resultsViewContainer.show();
    };

    // Poll for results
    var pollForResults = function (requestId) {
        var poll = setInterval(function () {
            $.ajax({
                type: 'GET',
                url: API_BASE_URL + 'results/' + requestId,
                dataType: 'json',
                success: function (data) {
                    if (data.status === 'completed') {
                        clearInterval(poll); // Stop polling
                        showResultsView(data);
                    } else {
                        // @TODO - update status/progress indicator
                        console.log('Keep going...');
                    }
                },
                error: function () {
                    alert('An error occurred while retrieving results. Please try again.');
                    showInputView();
                    clearInterval(poll); // Stop polling
                }
            });
        }, 2000);
    };

    // Upload a text file to the API
    var uploadTextFile = function () {
        
    };

    // Submit freeform text to the API
    var submitText = function () {

        var text = freeformText.val();

        if (typeof text !== 'string' || text.length < 1) {
            alert('Please enter some text');
            return;
        }

        // Always clear out any previous request ids being displayed
        clearDisplayedRequestId();

        // Queue the text for counting
        $.ajax({
            type: 'POST',
            url: API_BASE_URL + 'queue',
            dataType: 'json',
            data: {text: text},
            success: function (data) {
                // Store all recent requests in memory
                recentRequests.push(data.requestId);
                
                // Display the current request id
                requestIdDisplay.html(data.requestId);
                
                // Swith to "in progress" view
                showInProgressView(); 
                
                // Start polling for count results
                pollForResults(data.requestId);
            },
            error: function () {
                alert('An error occurred during text submission. Please try again.');
            }
        });
    };

    // Show the freeform text entry interface
    modeButtonFreeform.click(function () { showEntryView('freeform'); });

    // Show the file upload interface
    modeButtonUpload.click(function () { showEntryView('upload'); });

    // Submit text or file upload for counting
    submitTextButton.click(function () {
        switch (currentView) {
            case 'upload':      uploadTextFile();   break;
            case 'freeform':    submitText();       break;
            default:            submitText();       break;
        }
    });

    // Switch between text entry and recent requests within the input view
    inputViewTabs.click(function (e) {
        e.preventDefault();
        var viewTarget = $(this).attr('data-view-target');
        switch (viewTarget) {
            case 'text-input-view':
                myRequestsTab.removeClass('active');
                inputTab.addClass('active');
                myRequestsView.hide();
                inputView.show();
                break;

            case 'my-requests-view':
            default:
                inputTab.removeClass('active');
                myRequestsTab.addClass('active');
                inputView.hide();
                myRequestsView.show();
                break;
        }
    });

    // Switch between graph and raw data within the results view
    resultsViewTabs.click(function (e) {
        e.preventDefault();
        var viewTarget = $(this).attr('data-view-target');
        switch (viewTarget) {
            case 'raw-results-view':
                graphResultsTab.removeClass('active');
                rawResultsTab.addClass('active');
                graphResultsView.hide();
                rawResultsView.show();
                break;

            case 'graph-results-view':
            default:
                rawResultsTab.removeClass('active');
                graphResultsTab.addClass('active');
                rawResultsView.hide();
                graphResultsView.show();
                break;
        }
    });

    // Submit another count request following successful result
    $('button', resultsViewContainer).click(function () {
        freeformText.val('');
        showInputView();
    });

    // Show the about modal
    $('#about').click(function () {
        aboutModal.modal('show');
    });
});
