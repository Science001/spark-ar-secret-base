const NativeUI = require('NativeUI');
const Reactive = require('Reactive');
const Animation = require('Animation');
const Instruction = require('Instruction');
const Time = require('Time');

import { rad } from './helpers.js';

var queuedInstructions = [];
var currentInteractionInstruction = 'use_2_fingers_to_rotate';
export var isBackCamera = false;

export function setSun(sunLight, sunController) {
    sunLight.intensity = 50;
    let now = new Date();
    const sunDriver = Animation.valueDriver(now.getTime(), now.setHours(5, 30), now.setHours(18, 30));
    const sunSampler = Animation.samplers.linear(rad(90), rad(-90));
    const sunAnimation = Animation.animate(sunDriver, sunSampler);
    sunController.transform.rotationZ = sunAnimation;
}

export function setPicker(icon0, icon1) {
    const picker = NativeUI.picker;
    picker.configure({
        selectedIndex: 0,
        items: [
            { image_texture: icon0 },
            { image_texture: icon1 }
        ]
    });
    return picker;
}

export function setInstruction(instruction) {
    unsetAllInstructions();
    Instruction.bind(true, instruction);
}

export function setMovementInstructions() {
    unsetAllInstructions();
    Instruction.bind(true, 'tap_to_move_around');
    queuedInstructions.push(Time.setTimeout(() => (Instruction.bind(true, 'use_2_fingers_to_rotate')), 2000));
    queuedInstructions.push(Time.setTimeout(() => (Instruction.bind(true, 'pinch_to_zoom')), 4000));
    queuedInstructions.push(Time.setTimeout(unsetAllInstructions, 6000));
}

export function setInteractionInstruction(instruction=currentInteractionInstruction) {
    unsetAllInstructions();
    Instruction.bind(true, instruction);
    currentInteractionInstruction = instruction;
}

export function unsetAllInstructions() {
    queuedInstructions.forEach(i => (i.unsubscribe()));
    queuedInstructions = [];
    Instruction.bind(false, '');
}
