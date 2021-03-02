import { createAnimation } from '@ionic/core'

export const iosEnterAnimation = (baseEl) => {
    const baseAnimation = createAnimation();
    const backdropAnimation = createAnimation();
    const wrapperAnimation = createAnimation();

    backdropAnimation
        .addElement(baseEl.querySelector('ion-backdrop'))
.fromTo('opacity', 0.01, 'var(--backdrop-opacity)')
        .beforeStyles({
            'pointer-events': 'none'
        })
        .afterClearStyles(['pointer-events']);

    wrapperAnimation
        .addElement(baseEl.querySelector('.picker-wrapper'))
.fromTo('transform', 'translateY(-100%)', 'translateY(0%)');

    return baseAnimation
        .addElement(baseEl)
        .easing('cubic-bezier(.36,.66,.04,1)')
        .duration(400)
        .addAnimation([backdropAnimation, wrapperAnimation]);
};

export const iosLeaveAnimation = (baseEl) => {
    const baseAnimation = createAnimation();
    const backdropAnimation = createAnimation();
    const wrapperAnimation = createAnimation();

    backdropAnimation
        .addElement(baseEl.querySelector('ion-backdrop'))
.fromTo('opacity', 'var(--backdrop-opacity)', 0.01);

    wrapperAnimation
        .addElement(baseEl.querySelector('.picker-wrapper'))
.fromTo('transform', 'translateY(0%)', 'translateY(-100%)');

    return baseAnimation
        .addElement(baseEl)
        .easing('cubic-bezier(.36,.66,.04,1)')
        .duration(400)
        .addAnimation([backdropAnimation, wrapperAnimation]);
};