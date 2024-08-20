let distance = 0;
let speed = 0;
let maxSpeed = 0;
let avgSpeed = 0;
let speedSum = 0;
let speedCount = 0;
let lastPosition = null;
let measurementStarted = false;

function updateSpeedometer() {
    const speedElement = document.getElementById('speed');
    const progressElement = document.getElementById('progress');
    const barElement = document.getElementById('bar');
    const odometer = document.getElementById('odometer').children;
    const alertElement = document.getElementById('alert');
    const unitElement = document.getElementById('unit');
    const maxSpeedElement = document.getElementById('max-speed');
    const avgSpeedElement = document.getElementById('avg-speed');

    // Mise à jour de la vitesse affichée
    speedElement.textContent = Math.round(speed);

    // Mise à jour de la vitesse maximale atteinte
    if (speed > maxSpeed) {
        maxSpeed = speed;
    }
    maxSpeedElement.textContent = Math.round(maxSpeed);

    // Mise à jour de la vitesse moyenne
    speedSum += speed;
    speedCount++;
    avgSpeed = speedSum / speedCount;
    avgSpeedElement.textContent = Math.round(avgSpeed);

    // Calcul de l'angle pour la progression bleue (360° max pour 180 km/h)
    const angle = Math.min((speed / 180) * 360, 360);

    // Mise à jour de la barre de progression
    progressElement.style.background = `conic-gradient(#008cff 0% ${angle}deg, transparent ${angle}deg 360deg)`;

    // Mise à jour du fond du cercle
    if (speed > maxSpeed) {
        barElement.style.background = `conic-gradient(red 0% 360deg)`;
        alertElement.style.display = 'block'; // Affiche l'alerte
    } else {
        barElement.style.background = `conic-gradient(#444 0% 360deg)`;
        alertElement.style.display = 'none'; // Cache l'alerte
    }

    // Mise à jour de l'odomètre (distance parcourue)
    let distanceStr = String(Math.round(distance)).padStart(7, '0');
    for (let i = 0; i < odometer.length; i++) {
        odometer[i].textContent = distanceStr[i];
    }
}

function updatePrecision(accuracy) {
    const precisionBox = document.getElementById('precision-box');
    precisionBox.textContent = accuracy.toFixed(2) + ' m';

    // Mise à jour de la couleur en fonction de la précision
    let color;
    if (accuracy <= 10) {
        color = 'green';
    } else if (accuracy <= 25) {
        color = 'yellow';
    } else if (accuracy <= 50) {
        color = 'orange';
    } else {
        color = 'red';
    }
    precisionBox.style.backgroundColor = color;
}

function success(position) {
    const accuracy = position.coords.accuracy;
    const speedInMps = position.coords.speed || 0; // Vitesse en m/s
    speed = speedInMps * 3.6; // Convertit m/s en km/h

    updatePrecision(accuracy);

    if (lastPosition && measurementStarted) {
        const deltaDistance = calculateDistance(
            lastPosition.coords.latitude,
            lastPosition.coords.longitude,
            position.coords.latitude,
            position.coords.longitude
        );
        distance += deltaDistance;
    }
    lastPosition = position;
    updateSpeedometer();
}

function error(err) {
    console.error(`ERREUR (${err.code}): ${err.message}`);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Rayon de la Terre en mètres
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance en mètres
}

document.getElementById('convert').addEventListener('click', () => {
    const unitElement = document.getElementById('unit');
    const isKm = unitElement.textContent === 'km/h';
    unitElement.textContent = isKm ? 'miles/h' : 'km/h';
    speed = isKm ? speed / 1.609 : speed * 1.609;
    maxSpeed = isKm ? maxSpeed / 1.609 : maxSpeed * 1.609;
    avgSpeed = isKm ? avgSpeed / 1.609 : avgSpeed * 1.609;
    updateSpeedometer();
});

document.getElementById('start').addEventListener('click', () => {
    if (measurementStarted) {
        // Si la mesure est déjà active, réinitialiser et désactiver
        distance = 0;
        measurementStarted = false;
        speedSum = 0;
        speedCount = 0;
        maxSpeed = 0;
    } else {
        // Sinon, activer la mesure
        measurementStarted = true;
    }
    updateSpeedometer();
});

// Demande la géolocalisation
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(success, error, {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000
    });
} else {
    console.error('La géolocalisation n\'est pas supportée par ce navigateur.');
}
