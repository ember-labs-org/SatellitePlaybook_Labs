/* Ember Labs event tracking for the Coal Mine Methane Satellite Playbook.
 *
 * Uses Umami (cookieless, no personal data). The Umami script is loaded in index.html;
 * this file only watches the page for clicks and changes and reports the ones listed
 * below. It doesn't touch the Playbook's own code. If Umami is blocked or missing,
 * nothing happens and the Playbook works as normal.
 *
 * Every event carries tool: 'satellite-playbook' (one Umami website for all Labs tools).
 *
 * For the author: when rebuilding index.html, keep the two <script> lines for Umami and
 * analytics.js in the <head>. This file relies on these class names in the Playbook:
 * nextbtn, wf-back, rail-brand, hshow-obj, fopt/fgroup (ids fg-*), fclear, fselect,
 * mcard/mc-txt, acc-sum/stepn, relsec-toggle, check, srm-chip, tm-case, tm-btn, tm-gem,
 * tm-opt (+ good/bad), tm-step, rail-tour, tour-tip/cnt, sk, nx, cta, lnk. If any are renamed, update
 * them here too.
 *
 * Events
 *   playbook_entered             {}                   "Enter the playbook" on the intro
 *   showcase_scene_selected      {scene}              intro showcase tabs
 *   filter_selected              {group, option}      objective, coal asset type, location
 *   country_selected             {country}            reported-vs-satellite comparison
 *   filters_reset                {}
 *   instrument_opened            {instrument}         a satellite instrument card
 *   workflow_opened              {}                   "Continue to the workflow"
 *   workflow_back                {}                   "Back to instruments"
 *   workflow_step_opened         {step}               workflow accordion steps
 *   checklist_item_ticked        {item}
 *   related_studies_opened       {}
 *   tryme_opened                 {from, case}         from the plume map or the workflow
 *   tryme_case_switched          {case}
 *   tryme_step                   {case, step}         the exercise's step buttons
 *   tryme_asset_picked           {case}               a mine asset clicked as the source
 *   tryme_answered               {case, question, correct}
 *   tryme_closed                 {case}
 *   back_to_start                {}
 *   tour_started / tour_finished / tour_ended_early {step, title}
 *   contact_cta_clicked          {label}              "Start a conversation", "Let's collaborate"
 *   outbound_link_clicked        {domain, label}
 */
(function () {
    'use strict';

    var TOOL = 'satellite-playbook';

    function track(name, data) {
        try {
            if (!window.umami || typeof window.umami.track !== 'function') return;
            var payload = { tool: TOOL };
            if (data) {
                Object.keys(data).forEach(function (k) {
                    var v = data[k];
                    if (v !== undefined && v !== null && v !== '') payload[k] = v;
                });
            }
            window.umami.track(name, payload);
        } catch (e) {
            /* never let tracking break the Playbook */
        }
    }
    window.labsTrack = track;

    function text(el, max) {
        if (!el) return undefined;
        var t = (el.textContent || '').replace(/\s+/g, ' ').replace(/[→←▸✓›]/g, '').trim();
        return t ? t.slice(0, max || 60) : undefined;
    }
    function currentCase() {
        var on = document.querySelector('.tm-case.on');
        return on ? (on.getAttribute('title') || text(on)) : undefined;
    }
    // Nearest heading-like label above an element (used to name a quiz question).
    function nearest(el, selector) {
        var a = el.parentElement;
        while (a && !a.querySelector(selector)) a = a.parentElement;
        if (!a) return undefined;
        var all = a.querySelectorAll(selector);
        return all.length ? all[all.length - 1] : undefined;
    }

    document.addEventListener('click', function (e) {
        var t = e.target;
        if (!t || !t.closest) return;
        var el;

        // Links: contact calls to action, then any other link out.
        if ((el = t.closest('a[href]'))) {
            if (el.classList.contains('cta')) return track('contact_cta_clicked', { label: text(el) });
            var href = el.getAttribute('href') || '';
            if (/^https?:/i.test(href)) {
                var domain;
                try { domain = new URL(href).hostname.replace(/^www\./, ''); } catch (err) { domain = undefined; }
                return track('outbound_link_clicked', { domain: domain, label: text(el) });
            }
            return;
        }

        // Journey
        if ((el = t.closest('.nextbtn'))) {
            var label = text(el) || '';
            if (/enter the playbook/i.test(label)) return track('playbook_entered');
            if (/workflow/i.test(label)) return track('workflow_opened');
            return;
        }
        if (t.closest('.wf-back')) return track('workflow_back');
        if (t.closest('.rail-brand')) return track('back_to_start');
        if ((el = t.closest('.hshow-obj'))) return track('showcase_scene_selected', { scene: text(el.querySelector('.ho-t')) });

        // Explore: filters and instruments
        if ((el = t.closest('.fopt'))) {
            var group = el.closest('.fgroup');
            return track('filter_selected', {
                group: group && group.id ? group.id.replace(/^fg-/, '') : undefined,
                option: text(el.querySelector('.lb') || el)
            });
        }
        if (t.closest('.fclear')) return track('filters_reset');
        if ((el = t.closest('.mcard'))) {
            var txt = el.querySelector('.mc-txt');
            return track('instrument_opened', { instrument: text(txt && txt.firstElementChild ? txt.firstElementChild : txt) });
        }

        // Workflow
        if ((el = t.closest('.acc-sum'))) {
            if (el.getAttribute('aria-expanded') !== 'true') track('workflow_step_opened', { step: text(el.querySelector('.stepn')) });
            return;
        }
        if ((el = t.closest('.relsec-toggle'))) {
            if (el.getAttribute('aria-expanded') !== 'true') track('related_studies_opened');
            return;
        }
        if ((el = t.closest('.check'))) {
            if (!el.classList.contains('on')) track('checklist_item_ticked', { item: text(el) });
            return;
        }

        // Try-Me attribution exercise
        if ((el = t.closest('.srm-chip'))) {
            var title = el.getAttribute('title') || '';
            return track('tryme_opened', { from: 'plume_map', case: title.split(' · ')[0] || undefined });
        }
        if ((el = t.closest('button')) && /launch try-me/i.test(text(el) || '')) {
            setTimeout(function () { track('tryme_opened', { from: 'workflow', case: currentCase() }); }, 0);
            return;
        }
        if ((el = t.closest('.tm-case'))) return track('tryme_case_switched', { case: el.getAttribute('title') || text(el) });
        if ((el = t.closest('.tm-btn'))) {
            if (el.classList.contains('alt')) return track('tryme_closed', { case: currentCase() });
            return track('tryme_step', { case: currentCase(), step: text(el) });
        }
        if (t.closest('.tm-gem')) return track('tryme_asset_picked', { case: currentCase() });
        if ((el = t.closest('.tm-opt'))) {
            var btn = el;
            var stepEl = nearest(btn, '.tm-step') || nearest(btn, 'h3');
            var question = text(stepEl);
            // The Playbook marks the clicked answer "good" or "bad" when it re-renders.
            setTimeout(function () {
                var c = btn.classList.contains('good') ? true : (btn.classList.contains('bad') ? false : undefined);
                track('tryme_answered', { case: currentCase(), question: question, correct: c });
            }, 0);
            return;
        }
        if ((el = t.closest('button.x')) && el.closest('.tm, [class*="tm-"]')) return track('tryme_closed', { case: currentCase() });

        // Tour
        if (t.closest('.rail-tour')) return track('tour_started');
        if ((el = t.closest('.nx')) && /finish/i.test(text(el) || '')) return track('tour_finished');
        if ((el = t.closest('.sk'))) {
            var tip = el.closest('.tour-tip');
            return track('tour_ended_early', { step: text(tip && tip.querySelector('.cnt')), title: text(tip && tip.querySelector('h4')) });
        }
    }, true);

    document.addEventListener('change', function (e) {
        var t = e.target;
        if (t && t.classList && t.classList.contains('fselect')) {
            var opt = t.options && t.selectedIndex >= 0 ? t.options[t.selectedIndex] : null;
            track('country_selected', { country: opt && opt.value ? text(opt) : 'World' });
        }
    }, true);
})();
