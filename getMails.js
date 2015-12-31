      var CLIENT_ID = '36543128467-053adr5qc3tfrvkdlq94fd9v095m0gah.apps.googleusercontent.com';

      var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

      /**
       * Check if current user has authorized this application.
       */
      function checkAuth() {
        gapi.auth.authorize(
          {
            'client_id': CLIENT_ID,
            'scope': SCOPES.join(' '),
            'immediate': true
          }, handleAuthResult);
      }

      /**
       * Handle response from authorization server.
       *
       * @param {Object} authResult Authorization result.
       */
      function handleAuthResult(authResult) {
        var authorizeDiv = document.getElementById('authorize-div');
        if (authResult && !authResult.error) {
          // Hide auth UI, then load client library.
          authorizeDiv.style.display = 'none';
          loadGmailApi();
        } else {
          // Show auth UI, allowing the user to initiate authorization by
          // clicking authorize button.
          authorizeDiv.style.display = 'inline';
        }
      }

      /**
       * Initiate auth flow in response to user clicking authorize button.
       *
       * @param {Event} event Button click event.
       */
      function handleAuthClick(event) {
        gapi.auth.authorize(
          {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
          handleAuthResult);
        return false;
      }

      /**
       * Load Gmail API client library. List labels once client library
       * is loaded.
       */
      function loadGmailApi() {
        console.log("ok");
        gapi.client.load('gmail', 'v1', getMessages);
      }

      /**
       * Print all Labels in the authorized user's inbox. If no labels
       * are found an appropriate message is printed.
       */
      function listLabels() {
        var request = gapi.client.gmail.users.labels.list({
          'userId': 'me'
        });

        request.execute(function(resp) {
          var labels = resp.labels;
          appendPre('Labels:');

          if (labels && labels.length > 0) {
            for (i = 0; i < labels.length; i++) {
              var label = labels[i];
              appendPre(label.name)
            }
          } else {
            appendPre('No Labels found.');
          }
        });
      }

      function getMessages() {
        var request = gapi.client.gmail.users.threads.list({
          'userId': 'me',
          'q': 'is:unread',
          'maxResults':5
        });
        request.execute(function(resp) {
          console.log(resp);
          for (i = 0; i < resp.threads.length; i++) {
            getMessage(resp.threads[i].id);
          };
        });
      }

      function getMessage(messageId) {
        var request = gapi.client.gmail.users.threads.get({
          'userId': 'me',
          'id': messageId,
          'format': 'metadata'
        });
        request.execute(function(resp) {
            console.log(resp);
            sender = "";
            subject = "";
            date = "";
            h = resp.messages[0].payload.headers;
            for (i = 0; i < h.length; i++) {
               if(h[i].name=="From")
                sender = h[i].value;
              if(h[i].name=="Subject")
                subject = h[i].value;
              if(h[i].name=="Date")
                date = h[i].value;
            };
            if(sender!=""){
              el = "<div><strong>" + sender + "</strong> <small>(" + date + ")</small></br><strong>"+ subject + "</strong></br></br></div>";
              appendPre(el)
            }
        });
      }

      /**
       * Append a pre element to the body containing the given message
       * as its text node.
       *
       * @param {string} message Text to be placed in pre element.
       */
      function appendPre(message) {
        var pre = document.getElementById('mails');
        pre.innerHTML = pre.innerHTML + message;
      }