export function rotatePlane(placerTransform, gesture, snapshot) {
    const correctRotation = gesture.rotation.mul(-1);
    placerTransform.rotationY = correctRotation.add(snapshot.lastRotationY);
}

export function scalePlane(placerTransform, gesture, snapshot) {
    placerTransform.scaleX = gesture.scale.mul(snapshot.lastScaleX);
    placerTransform.scaleY = gesture.scale.mul(snapshot.lastScaleY);
    placerTransform.scaleZ = gesture.scale.mul(snapshot.lastScaleZ);
}

export function movePlane(gesture, planeTracker) {
    planeTracker.trackPoint(gesture.location, gesture.state);
}

export function revealPlane(placer) {
    placer.hidden = false;
}
