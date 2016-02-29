jQuery(document).ready(function ($) {

    // Only reveal the action interface for JavaScript-enabled users
    $('.js-only').show();

    var API_BASE_URL = '/'
      , currentView = 'freeform'
      , modeButtonFreeform = $('#input-mode-controller button:nth-child(1)')
      , modeButtonUpload = $('#input-mode-controller button:nth-child(2)')
      , inputViewContainer = $('#input-view-container')
      , inProgressViewContainer = $('#in-progress-view-container')
      , resultsViewContainer = $('#results-view-container')
      , submitButton = $('#submit-counts')
      , progressBar = $('.progress-bar', inProgressViewContainer)
      , progressBarInterval;

    /**
     * Clears the progress bar
     */
    var clearProgressBar = function () {
        if (progressBarInterval) {
            clearInterval(progressBarInterval);
        }
        progressBar.attr('aria-valuenow', 0);
        progressBar.css('width', '0');
    };

    /**
     * Clear any displayed request ids
     */
    var clearRequestId = function () {
        $('.request-id').html('');
    };

    /**
     * Show the specified input entry view
     * @param string type
     */
    var showEntryView = function (type) {
        switch (type) {
            case 'upload':
                currentView = 'upload';
                modeButtonFreeform.removeClass('active');
                modeButtonUpload.addClass('active');
                $('#freeform-text-container').hide();
                $('#upload-text-container').show();
                break;
            case 'freeform':
            default:
                currentView = 'freeform';
                modeButtonUpload.removeClass('active');
                modeButtonFreeform.addClass('active');
                $('#upload-text-container').hide();
                $('#freeform-text-container').show();
                break;
        }
    };

    /**
     * Show the results view
     */
    var showInputView = function () {
        clearRequestId();
        resultsViewContainer.hide();
        inProgressViewContainer.hide();
        inputViewContainer.show();
    };

    /**
     * Show the in-progress view
     */
    var showInProgressView = function () {
        inputViewContainer.hide();
        resultsViewContainer.hide();
        inProgressViewContainer.show();
    };

    /**
     * Show the results view
     */
    var showResultsView = function (data) {
        clearRequestId();
        clearProgressBar();
        inputViewContainer.hide();
        inProgressViewContainer.hide();
        resultsViewContainer.show();
        $('#results-view pre').html(JSON.stringify(data, null, 2));
    };

    /**
     * Poll for results
     */
    var pollForResults = function (requestId) {
        var poll = setInterval(function () {
            console.log('Polling for: ' + requestId);

            $.ajax({
                type: 'GET',
                url: API_BASE_URL + 'results/' + requestId,
                dataType: 'json',
                success: function (data) {
                    console.log('POLL DATA: ', data);

                    if (data.status === 'completed') {
                        clearInterval(poll);
                        showResultsView(data);
                    } else {
                        // @TODO - update status/progress indicator
                        console.log('Keep going...');
                    }
                },
                error: function () {
                    alert('An error occurred while retrieving results. Please try again.');
                    showInputView();
                    clearInterval(poll);
                }
            });
        }, 2000);
    };

    /**
     * Submit a text file to the API
     */
    var submitTextFile = function () {
        
    };

    /**
     * Submit freeform text to the API
     */
    var submitText = function () {

        var text = $('#freeform-text').val();

        if (typeof text !== 'string' || text.length < 1) {
            alert('Please enter some text');
            return;
        }

        $.ajax({
            type: 'POST',
            url: API_BASE_URL + 'queue',
            dataType: 'json',
            data: {text: text},
            success: function (data) {
                $('.request-id').html(data.requestId);
                showInProgressView();
                
                var progressNum = 0;
                
                progressBarInterval = setInterval(function () {
                    progressNum += 10;
                    progressBar.attr('aria-valuenow', progressNum);
                    progressBar.css('width', '' + progressNum + '%');

                    if (progressNum >= 100) {
                        clearProgressBar();
                    }
                }, 200);
                
                pollForResults(data.requestId);
            },
            error: function () {
                alert('An error occurred during text submission. Please try again.');
            }
        });
    };

    modeButtonFreeform.click(function () {
        showEntryView('freeform');
    });

    modeButtonUpload.click(function () {
        showEntryView('upload');
    });

    submitButton.click(function () {

        // @TODO - immediatly switch to "in progress" view

        switch (currentView) {
            case 'upload':
                submitTextFile();
                break;
            case 'freeform':
            default:
                submitText();
                break;
        }

        // @TODO - start polling for results
    });

    // Submit another count request following successful result
    $('button', resultsViewContainer).click(function () {
        $('#freeform-text').val('');
        showInputView();
    });

    // Show the about modal
    $('#about').click(function () {
        $("#aboutModal").modal('show');
    });
});