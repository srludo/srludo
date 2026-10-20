// 1. Android App jab token bhejegi, ye function use pakdega
window.receiveFCMToken = function(fcmToken) {
    if (!fcmToken) return;
    localStorage.setItem("user_fcm_token", fcmToken);
    uploadTokenToFirebase(fcmToken);
};

// 2. Token ko Firebase Database mein save karein
function uploadTokenToFirebase(token) {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        var user = firebase.auth().currentUser;
        if (user && token) {
            firebase.database().ref('users/' + user.uid).update({
                fcmToken: token
            });
        }
    }
}

// 3. Login hote hi token database mein save ho jaye
if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            var token = localStorage.getItem("user_fcm_token");
            if (token) {
                uploadTokenToFirebase(token);
            }
        }
    });
}

// 4. Opponent ko automatic notification bhejne ka function
function sendLudoAlert(targetToken, title, message) {
    if (!targetToken) {
        console.log("Opponent ka token nahi mila.");
        return;
    }

    fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'key=YOUR_SERVER_KEY_HERE' // Step 2 dekhein
        },
        body: JSON.stringify({
            to: targetToken,
            data: {
                title: title,
                body: message
            },
            priority: 'high'
        })
    }).catch(function(err) {
        console.error("Notification send error:", err);
    });
}
