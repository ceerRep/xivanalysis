/* eslint-disable */

import React, {Fragment} from 'react'
import _ from 'lodash'

import ACTIONS, {getAction} from 'data/ACTIONS'
import STATUSES, {getStatus} from 'data/STATUSES'
import {ARCANA_USE, EXPANDED_ARCANA_USE, DRAWN_ARCANA_USE, HELD_ARCANA_USE, ROYAL_ROAD_STATES, DRAWN_ARCANA, HELD_ARCANA} from './ArcanaGroups'
import JobIcon from 'components/ui/JobIcon'
import JOBS from 'data/JOBS'
// import STATUSES from 'data/STATUSES'
import Module from 'parser/core/Module'

import {Suggestion, SEVERITY} from 'parser/core/modules/Suggestions'
import {ActionLink} from 'components/ui/DbLink'
// import {Accordion} from 'semantic-ui-react'
import {Table} from 'semantic-ui-react'
import styles from './ArcanaTracking.module.css'

const LINKED_EVENT_THRESHOLD = 20

const MINOR_ARCANA_USE = [
	ACTIONS.LADY_OF_CROWNS.id,
	ACTIONS.LORD_OF_CROWNS.id,
]

const OGCD_ARCANA_REMOVAL = [
	ACTIONS.UNDRAW_SPREAD.id,
	ACTIONS.EMPTY_ROAD.id,
	ACTIONS.UNDRAW.id,
]

const CARD_ACTIONS = [
	ACTIONS.DRAW.id,
	ACTIONS.REDRAW.id,
	ACTIONS.SPREAD.id,
	ACTIONS.ROYAL_ROAD.id,
	ACTIONS.SLEEVE_DRAW.id,
	ACTIONS.MINOR_ARCANA.id,
	...MINOR_ARCANA_USE,
	...OGCD_ARCANA_REMOVAL,
	...ARCANA_USE,
	...EXPANDED_ARCANA_USE,
]

const ARCANA_STATUSES = [
	STATUSES.THE_BALANCE.id,
	STATUSES.THE_BOLE.id,
	STATUSES.THE_ARROW.id,
	STATUSES.THE_SPEAR.id,
	STATUSES.THE_EWER.id,
	STATUSES.THE_SPIRE.id,
]

const DRAWN_ACTION_TO_STATUS_LOOKUP = _.zipObject(DRAWN_ARCANA_USE, [...DRAWN_ARCANA, ...DRAWN_ARCANA])
const HELD_ACTION_TO_STATUS_LOOKUP = _.zipObject(HELD_ARCANA_USE, [...HELD_ARCANA, ...HELD_ARCANA])


export default class ArcanaTracking extends Module {
	static handle = 'arcanatracking'
	static dependencies = [
		'precastStatus', // eslint-disable-line xivanalysis/no-unused-dependencies
		'arcanum', // eslint-disable-line xivanalysis/no-unused-dependencies
		'suggestions',
	]
	static title = 'Arcana Tracking'

	constructor(...args) {
		super(...args)

		const cardActionFilter = {
			by: 'player',
			abilityId: CARD_ACTIONS,
		}

		// const cardStatusoffFilter = {
		// 	abilityID: ROYAL_ROAD_STATES,
		// }

		this.addHook('cast', cardActionFilter, this._onCast)
		this.addHook('applybuff', {by: 'player'}, this._onSelfBuff)
		this._onArcanaBuffHook = null
		this.addHook('removebuff', {by: 'player'}, this._offStatus)
		this.addHook('death', {to: 'player'}, this._onDeath)
		this.addHook('complete', this._onComplete)

		this._minorArcanaHistory = []
		this._cardStateLog = []
		this._minorArcanasLost = 0

	}

	_onSelfBuff(event) {
		if (![...ARCANA_STATUSES, ...ROYAL_ROAD_STATES, ...DRAWN_ARCANA, ...HELD_ARCANA].includes(event.ability.guid)) {
			return
		}

		if (ROYAL_ROAD_STATES.includes(event.ability.guid)) {
			console.log(event)

			this._cardStateLog.forEach((stateItem) => {
				if(stateItem.lastEvent) {
					console.log(event.timestamp + " " + stateItem.lastEvent.timestamp + " " + stateItem.lastEvent.ability.name)
				}
				if (stateItem.lastEvent 
					&& _.inRange(event.timestamp, stateItem.lastEvent.timestamp - LINKED_EVENT_THRESHOLD, stateItem.lastEvent.timestamp + LINKED_EVENT_THRESHOLD)) {
					stateItem.rrAbility = getStatus(event.ability.guid)
				}
			})
		}

		if (DRAWN_ARCANA.includes(event.ability.guid)) {
			console.log(event)
			this._cardStateLog.forEach((stateItem) => {
				if (stateItem.lastEvent 
					&& _.inRange(event.timestamp, stateItem.lastEvent.timestamp - LINKED_EVENT_THRESHOLD, stateItem.lastEvent.timestamp + LINKED_EVENT_THRESHOLD)) {
					stateItem.drawState = getStatus(event.ability.guid)
				}
			})
		}

		if (HELD_ARCANA.includes(event.ability.guid)) {
			console.log(event)
			this._cardStateLog.forEach((stateItem) => {
				if (stateItem.lastEvent 
					&& _.inRange(event.timestamp, stateItem.lastEvent.timestamp - LINKED_EVENT_THRESHOLD, stateItem.lastEvent.timestamp + LINKED_EVENT_THRESHOLD)) {
					stateItem.spreadState = getStatus(event.ability.guid)
				}
			})
		}

	}

	_onArcanaBuff(event) {
		// this is coming right after an arcana cast with no rrAbility, so if there is, we need to go back and fix the log
		if (ARCANA_STATUSES.includes(event.ability.guid) && event.rrAbility) {
			let lastRoyalRoadIndex = _.findLastIndex(this._cardStateLog,
				stateItem =>
					stateItem.lastEvent &&
				(stateItem.lastEvent.ability.guid === ACTIONS.SLEEVE_DRAW.id
				|| stateItem.lastEvent.ability.guid === ACTIONS.ROYAL_ROAD.id)
			)

			if (lastRoyalRoadIndex === -1) {
				// There were no RRs or Sleeve Draws. They had it prepull, so assume this is 0
				lastRoyalRoadIndex = 0

				// Modify log, they were holding onto this rrAbility since index
				_.forEachRight(this._cardStateLog,
					(stateItem, index) => {
						if (index >= lastRoyalRoadIndex && index !== this._cardStateLog.length - 1) { stateItem.rrAbility = getStatus(event.rrAbility.guid) }
						if (index === this._cardStateLog.length - 1) { stateItem.lastEvent.rrAbility = getStatus(event.rrAbility.guid) }
					})
			}

			// this.retconSearch([ACTIONS.SLEEVE_DRAW.id, ACTIONS.ROYAL_ROAD.id], 'rrAbility', event.ability.guid)
		}

		this.removeHook(this._onArcanaBuffHook)
	}

	_offStatus(event) {


		if(DRAWN_ARCANA.includes(event.ability.guid)) {
			console.log(event)


			// a) check if this card was obtained legally, if not, retcon the logs
			if(!_.last(this._cardStateLog).drawState && !DRAWN_ARCANA_USE.includes(_.last(this._cardStateLog).lastEvent.ability.guid)){
				this.retconSearch([ACTIONS.DRAW.id,ACTIONS.SLEEVE_DRAW.id, ACTIONS.REDRAW.id], 'drawState', event.ability.guid)
			}

			// b) check if this was a standalone statusoff/undraw, if so, add to logs
			const isPaired = this._cardStateLog.findIndex(stateItem => stateItem.lastEvent 
				&& _.inRange(event.timestamp, stateItem.lastEvent.timestamp - LINKED_EVENT_THRESHOLD,stateItem.lastEvent.timestamp + LINKED_EVENT_THRESHOLD))

			// TODO: Differenciate between draw timeouts and intentional undraws
			if(isPaired < 0){
				console.log("IS UNDRAW")
				const cardStateItem = {..._.last(this._cardStateLog)}
				const lastEvent = {
					ability: {...ACTIONS.UNDRAW, guid: ACTIONS.UNDRAW.id},
					timestamp: event.timestamp,
				}

				cardStateItem.lastEvent = lastEvent
				cardStateItem.drawState = null

				this._cardStateLog.push(cardStateItem)
			}
	
		}

		if(HELD_ARCANA.includes(event.ability.guid)) {



			// a) check if this existed, if not, retcon the logs
			if(!_.last(this._cardStateLog).spreadState && !HELD_ARCANA_USE.includes(_.last(this._cardStateLog).lastEvent.ability.guid)){
				console.log('retconspread')
				this.retconSearch([ACTIONS.SPREAD.id, ACTIONS.SLEEVE_DRAW.id], 'spreadState', event.ability.guid)
			}

			// b) check if this was a standalone statusoff/undraw, if so, add to logs
			const isPaired = this._cardStateLog.findIndex(stateItem => stateItem.lastEvent 
				&& _.inRange(event.timestamp, stateItem.lastEvent.timestamp - LINKED_EVENT_THRESHOLD,stateItem.lastEvent.timestamp + LINKED_EVENT_THRESHOLD))

			if(isPaired < 0){
				console.log("IS UNDRAW_SPREAD")
				console.log(event)
				const cardStateItem = {..._.last(this._cardStateLog)}
				const lastEvent = {
					ability: {...ACTIONS.UNDRAW_SPREAD, guid: ACTIONS.UNDRAW_SPREAD.id},
					timestamp: event.timestamp,
				}

				cardStateItem.lastEvent = lastEvent
				cardStateItem.spreadState = null

				console.log(cardStateItem)

				this._cardStateLog.push(cardStateItem)
			}
		}

		if (ROYAL_ROAD_STATES.includes(event.ability.guid)) {

			const isPaired = !this._cardStateLog.findIndex(stateItem => stateItem.lastEvent 
				&& _.inRange(event.timestamp, stateItem.lastEvent.timestamp - LINKED_EVENT_THRESHOLD,stateItem.lastEvent.timestamp + LINKED_EVENT_THRESHOLD))

			console.log(event.timestamp)
			console.log(isPaired)
			if(isPaired < 0) {
				console.log('EMPTY ROAD')
				// console.log(event)

				const cardStateItem = {..._.last(this._cardStateLog)}
				const lastEvent = {
					ability: {...ACTIONS.EMPTY_ROAD, guid: ACTIONS.EMPTY_ROAD.id},
					timestamp: event.timestamp,
				}

				cardStateItem.lastEvent = lastEvent
				cardStateItem.rrAbility = null

				// TODO: insert a new action into the log

				this._cardStateLog.push(cardStateItem)
			}
		
		}



	}

	_onCast(event) {

		const actionId = event.ability.guid

		// Piecing together what they have on prepull
		if (this._cardStateLog.length === 0) {
			this._cardStateLog.push(this._initPullState(event))
		}

		const cardStateItem = {..._.last(this._cardStateLog)}

		cardStateItem.lastEvent = event

		// If they used any arcana, consider the rrAbility consumed
		if (DRAWN_ARCANA_USE.includes(actionId) || HELD_ARCANA_USE.includes(actionId)) {
			console.log(event)
			// If this is the first Arcana they've played and there is no rrAbility, get suspicious about prepull rr states
			if (this._cardStateLog.findIndex(stateItem => stateItem.lastEvent
				&& [...ARCANA_USE, ...EXPANDED_ARCANA_USE].includes(stateItem.lastEvent.ability.guid)) === -1) {
				// Look out for the next arcana buff to check the rrState
				this._onArcanaBuffHook = this.addHook('applybuff', {by: 'player'}, this._onArcanaBuff)
			}

			cardStateItem.lastEvent.rrAbility = cardStateItem.rrAbility
			cardStateItem.rrAbility = null
		}

		// If it was a drawn arcana, they had to have been holding onto this from the last instance of a DRAW/SLEEVE_DRAW/REDRAW
		// Loop backward and find it
		if (DRAWN_ARCANA_USE.includes(actionId)) {
			cardStateItem.drawState = null

			this.retconSearch([ACTIONS.DRAW.id, ACTIONS.SLEEVE_DRAW.id, ACTIONS.REDRAW.id], 'drawState', actionId)

		}

		// If it was a drawn arcana, they had to have been holding onto this from the last instance of a SPREAD/SLEEVE_DRAW
		// Loop backward and find it
		if (HELD_ARCANA_USE.includes(actionId)) {
			cardStateItem.spreadState = null	
			this.retconSearch([ACTIONS.SPREAD.id, ACTIONS.SLEEVE_DRAW.id], 'spreadState', actionId)
		}

		if (actionId === ACTIONS.ROYAL_ROAD.id) {
			console.log(event)
			const enhanced = [STATUSES.BALANCE_DRAWN.id, STATUSES.BOLE_DRAWN.id]
			const extended = [STATUSES.ARROW_DRAWN.id, STATUSES.SPEAR_DRAWN.id]
			const expanded = [STATUSES.EWER_DRAWN.id, STATUSES.SPIRE_DRAWN.id]

			if(enhanced.includes(cardStateItem.drawState.id) ) {
				cardStateItem.rrAbility = STATUSES.ENHANCED_ROYAL_ROAD
			}
			if(extended.includes(cardStateItem.drawState.id) ) {
				cardStateItem.rrAbility = STATUSES.EXTENDED_ROYAL_ROAD
			}
			if(expanded.includes(cardStateItem.drawState.id) ) {
				cardStateItem.rrAbility = STATUSES.EXPANDED_ROYAL_ROAD
			}

			cardStateItem.drawState = null
		}

		// MINOR ARCANA STUFF
		if (actionId === ACTIONS.MINOR_ARCANA.id) {
			cardStateItem.drawState = null
			this._onMinorArcana(event)
		}
		if (actionId === ACTIONS.SPREAD.id) {
			cardStateItem.drawState = null
		}
		if (actionId === ACTIONS.REDRAW.id) {
			console.log(event)
		}
	
		if (actionId === ACTIONS.SLEEVE_DRAW.id) {
			console.log(event)
			this._onSleeveDraw(event)
		}

		if (actionId === ACTIONS.UNDRAW.id) {
			cardStateItem.drawState = null
		}
		if (actionId === ACTIONS.EMPTY_ROAD.id) {
			cardStateItem.rrAbility = null
		}
		if (actionId === ACTIONS.UNDRAW_SPREAD.id) {
			console.log("undraw spread action" + " " + this.parser.formatTimestamp(event.timestamp))
			console.log(event)
			cardStateItem.spreadState = null
		}

		if (MINOR_ARCANA_USE.includes(actionId)) {
			cardStateItem.minorState = null

			let lastMinorIndex = _.findLastIndex(this._cardStateLog,
				stateItem =>
					stateItem.lastEvent &&
				(stateItem.lastEvent.ability.guid === ACTIONS.SLEEVE_DRAW.id
				|| stateItem.lastEvent.ability.guid === ACTIONS.MINOR_ARCANA.id)
			)

			if (lastMinorIndex === -1) {
				// There were no spreads. They had it prepull, so assume this is 0
				lastMinorIndex = 0
			}

			// Modify log, they were holding onto this card since index
			_.forEachRight(this._cardStateLog,
				(stateItem, index) => {
					if (index >= lastMinorIndex) { stateItem.minorState = getAction(actionId) }
				})
			this._onMinorArcanaUse(event)
		}

		this._cardStateLog.push(cardStateItem)

	}

	_onDeath(event) {
		console.log('DEATH')
		console.log(event)
		const cardStateItem = {
			rrAbility: null,
			drawState: null,
			spreadState: null,
			minorState: null,
		}

		cardStateItem.lastEvent = {
			...event,
			ability: {
				name: 'Death',
				icon: ACTIONS.RAISE.icon, 
				guid: ACTIONS.RAISE.id,
			},
			overrideDB: '1'

		}
		this._cardStateLog.push(cardStateItem)

	}

	_initPullState(event) {
		const actionId = event.ability.guid

		const pullStateItem = {
			lastEvent: null,
			rrAbility: null,
			drawState: null,
			spreadState: null,
			minorState: null,
		}

		if (EXPANDED_ARCANA_USE.includes(actionId)) {
			// They had an expanded RR first!
			pullStateItem.rrAbility = STATUSES.EXPANDED_ROYAL_ROAD
		}

		if (DRAWN_ARCANA_USE.includes(actionId)
			|| actionId === ACTIONS.MINOR_ARCANA.id
			|| actionId === ACTIONS.ROYAL_ROAD.id) {
			// They had something in the draw slot
			pullStateItem.drawState = getAction(actionId)
		}

		if (HELD_ARCANA_USE.includes(actionId)) {
			// They had something in spread
			pullStateItem.spreadState = getAction(actionId)
		}

		if (MINOR_ARCANA_USE.includes(actionId)) {
			// They had a minor arcana
			pullStateItem.minorState = getAction(actionId)
		}

		return pullStateItem
	}

	_onMinorArcanaUse(event) {
		this._minorArcanaHistory.push(event)
	}

	_onMinorArcana(event) {
		this._minorArcanaHistory.push(event)
	}

	_onSleeveDraw(event) {
		if (!_.last(this._cardStateLog).minorState) {
			// Minor arcana lost
			this._minorArcanasLost++
		}

		this._minorArcanaHistory.push(event)
	}

	_onComplete() {
		console.log(this._cardStateLog)

		const sleeveUses = this._minorArcanaHistory.filter(artifact => artifact.ability.guid === ACTIONS.SLEEVE_DRAW.id).length

		this.suggestions.add(new Suggestion({
			icon: ACTIONS.MINOR_ARCANA.icon,
			content: <Fragment>
					Never use <ActionLink {...ACTIONS.SLEEVE_DRAW} /> before clearing your <ActionLink {...ACTIONS.MINOR_ARCANA} /> slot. You lose
					out on the opportunity to obtain another <ActionLink {...ACTIONS.LORD_OF_CROWNS} /> or <ActionLink {...ACTIONS.LADY_OF_CROWNS} /> for free.
			</Fragment>,
			severity: SEVERITY.MAJOR,
			why: <Fragment>
				{this._minorArcanasLost} of {sleeveUses} Sleeve Draws were used despite already having a filled Minor Arcana slot.
			</Fragment>,
		}))
	}

	/**
	 * Loops back to see if the specified card id was in possession without the possiblity of it being obtained via legal abilities.
	 * This is presumed to mean they had it prepull. This function will then retcon the history since we know they had it.
	 *
	 * @param abilityLookups{array} Array of abilities that determine how they obtained it.
	 * @param slot{array} The spread slot that this card id should have been visible
	 * @param actionId{array} The specified card action id
	 * @return {void} null
	 */
	retconSearch(abilityLookups, slot, actionId) {

		let searchLatest = true
		let latestActionId = _.last(this._cardStateLog).lastEvent.ability.guid

		if(slot === 'spreadState' && [ACTIONS.UNDRAW_SPREAD.id, ...HELD_ARCANA_USE].includes(latestActionId)  ) {
			searchLatest = false
		}
		if(slot === 'drawState' && [ACTIONS.UNDRAW.id, ...DRAWN_ARCANA_USE].includes(latestActionId)  ) {
			searchLatest = false
		}
		if(slot === 'rrAbility' && [ACTIONS.EMPTY_ROAD.id, ...DRAWN_ARCANA_USE, ...HELD_ARCANA_USE].includes(latestActionId)  ) {
			searchLatest = false
		}

		const searchLog = searchLatest ? this._cardStateLog : this._cardStateLog.slice(0, this._cardStateLog.length - 2)

		let lastIndex = _.findLastIndex(searchLog,
			stateItem =>
				stateItem.lastEvent &&
				abilityLookups.includes(stateItem.lastEvent.ability.guid)
		)

		if (lastIndex === -1) {
			// There were none finds of specified abilities. They had it prepull, so assume this is 0
			lastIndex = 0

			// Modify log, they were holding onto this card since index
			_.forEachRight(this._cardStateLog,
				(stateItem, index) => {
					if(searchLatest) {
						if (index >= lastIndex) { stateItem[slot] = getStatus(this.arcanaActionToStatus(actionId)) }
					} else {
						console.log("not search latest")
						if (index >= lastIndex && index !== this._cardStateLog.length - 1) { stateItem[slot] = getStatus(this.arcanaActionToStatus(actionId)) }
						if (index === this._cardStateLog.length - 1 && slot === 'rrAbility') { stateItem.lastEvent[slot] = getStatus(this.arcanaActionToStatus(actionId)) }
					}
				})
		}
	}

	arcanaActionToStatus(arcanaId) {
		if (DRAWN_ARCANA_USE.includes(arcanaId)) {
			arcanaId = DRAWN_ACTION_TO_STATUS_LOOKUP[arcanaId]
		}

		if (HELD_ARCANA_USE.includes(arcanaId)) {
			arcanaId = HELD_ACTION_TO_STATUS_LOOKUP[arcanaId]
		}

		return arcanaId
	}

	output() {
		const cardLogs = this._cardStateLog.map(artifact => {

			const isArcana = artifact.lastEvent && [...DRAWN_ARCANA_USE, ...HELD_ARCANA_USE].includes(artifact.lastEvent.ability.guid)
			const target = isArcana ? this.parser.modules.combatants.getEntity(artifact.lastEvent.targetID) : null
			const targetName = target ? target.info.name : null
			const targetJob = target ? target.info.type : null

			return {
				timestamp: artifact.lastEvent ? artifact.lastEvent.timestamp : this.parser.fight.start_time,
				lastAction: artifact.lastEvent ? {
					id: artifact.lastEvent.ability.guid,
					actionName: artifact.lastEvent.ability.name,
					targetName: targetName,
					targetJob: targetJob,
					isArcana: isArcana,
					overrideDB: artifact.lastEvent.overrideDB,
					rrAbility: artifact.lastEvent.rrAbility,
				} : null,
				state: {
					rrAbility: artifact.rrAbility,
					spread: artifact.spreadState,
					draw: artifact.drawState,
					minorArcana: artifact.minorState,
				},
			}
		})

		const pullState = cardLogs.shift()
		console.log(cardLogs)

		return <Table collapsing unstackable>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell width={1}>Time</Table.HeaderCell>
					<Table.HeaderCell width={4}>Lastest Action</Table.HeaderCell>
					<Table.HeaderCell width={2}>Spread State</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				<Table.Row key={pullState.timestamp}>
					<Table.Cell>{this.parser.formatTimestamp(pullState.timestamp)}</Table.Cell>
					<Table.Cell>
						Pull
					</Table.Cell>
					{this.RenderSpreadState(pullState)}
				</Table.Row>

				{cardLogs.map(artifact => {
					return <Table.Row key={artifact.timestamp}>
						<Table.Cell>{this.parser.formatTimestamp(artifact.timestamp)}</Table.Cell>
						{this.RenderAction(artifact)}
						{this.RenderSpreadState(artifact)}

					</Table.Row>
				}
				)}
			</Table.Body>
		</Table>
	}

	RenderAction(artifact) {
		if (artifact.lastAction.isArcana) {
			const status = artifact.lastAction.rrAbility || null
			return <Table.Cell>
				<ActionLink {...getAction(artifact.lastAction.id)} />
				{status && <img
					src={status.icon}
					className={styles.buffIcon}
					alt={status.name}
				/> }<br/>
				{artifact.lastAction.targetJob &&
					<JobIcon
						job={JOBS[artifact.lastAction.targetJob]}
						className={styles.jobIcon}
					/>
				}

				{artifact.lastAction.targetName}
			</Table.Cell>
		}
		return <Table.Cell>
		{artifact.lastAction.overrideDB && 
			<Fragment>{artifact.lastAction.actionName}</Fragment>
		}
		{!artifact.lastAction.overrideDB && 
			<ActionLink {...getAction(artifact.lastAction.id)} />
		}
		</Table.Cell>

	}

	RenderSpreadState(artifact) {

		const spread = artifact.state.spread || null
		const draw = artifact.state.draw || null
		const rrAbility = artifact.state.rrAbility || null
		const minorArcana = artifact.state.minorArcana

		return <Table.Cell>
			{rrAbility && <img
				src={rrAbility.icon}
				className={styles.buffIcon}
				alt={rrAbility.name}
			/>}
			{!rrAbility && <span className={styles.buffDummy} />}
			<br/>
			{spread && <img
				src={spread.icon}
				className={styles.buffIcon}
				alt={spread.name}
			/>}
			{!spread && <span className={styles.buffDummy} />}
			{draw && <img
				src={draw.icon}
				className={styles.buffIcon}
				alt={draw.name}
			/>}
			{!draw && <span className={styles.buffDummy} />}
			{minorArcana && <img
				src={minorArcana.icon}
				className={styles.spread_slot3}
				alt={minorArcana.name}
			/>}
			{!minorArcana && <span className={styles.buffDummy} />}
		</Table.Cell>
	}
}

