/********************************************************************************
 * Copyright (c) 2020 Cedalo AG
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 ********************************************************************************/
/* eslint-disable react/forbid-prop-types,react/no-unused-prop-types,jsx-a11y/click-events-have-key-events  */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import jsonpath from 'jsonpath';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import CardContent from '@material-ui/core/CardContent';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import styles from './styles';
import ResourceCardHeader from './ResourceCardHeader';
import * as Colors from '@material-ui/core/colors';
import SortSelector from '../sortSelector/SortSelector';
// import { shorten } from './Utils';

const DEF_STYLES = {
	MuiGridList: {
		marginLeft: 0
	}
};
const PREF_KEY_SORTQUERY = 'streamsheets-prefs-listing-sortby';

class ResourcesGrid extends React.Component {
	static propTypes = {
		label: PropTypes.object.isRequired,
		disabled: PropTypes.bool,
		menuOptions: PropTypes.array.isRequired,
		resources: PropTypes.array.isRequired,
		recent: PropTypes.array,
		onMenuSelect: PropTypes.func,
		onResourceOpen: PropTypes.func.isRequired,
		icon: PropTypes.element,
		headerIcons: PropTypes.arrayOf(PropTypes.object),
		images: PropTypes.bool,
		gridWidth: PropTypes.number,
		handleResourceDetails: PropTypes.func,
		titleAttribute: PropTypes.string.isRequired,
		styles: PropTypes.object,
		onChecked: PropTypes.func,
		dummy: PropTypes.number,
		checked: PropTypes.arrayOf(PropTypes.string),
		showControlButtons: PropTypes.bool
	};

	static defaultProps = {
		dummy: -1,
		disabled: false,
		images: false,
		handleResourceDetails: undefined,
		headerIcons: [],
		icon: undefined,
		styles: DEF_STYLES,
		onChecked: undefined,
		checked: [],
		recent: [],
		gridWidth: 0,
		showControlButtons: true,
		onMenuSelect: undefined
	};

	constructor(props) {
		super(props);
		this.state = {
			checked: [...props.checked] || [],
			sortQuery: localStorage.getItem(PREF_KEY_SORTQUERY),
		};
		this.gridRef = React.createRef();
	}

	handleChecked = (resourceId) => () => {
		const checked = [...this.state.checked];
		const index = checked.indexOf(resourceId);
		if (index >= 0) {
			checked.splice(index, 1);
		} else {
			checked.push(resourceId);
		}
		this.setState({
			checked
		});
		this.props.onChecked(resourceId, checked);
	};

	handleOpenClick = (resource) => {
		if (this.props.onResourceOpen) {
			this.props.onResourceOpen(resource, true);
		}
	};

	handleContextMenu = (event, resource) => {
		this.props.onResourceOpen(resource, true);
		event.stopPropagation();
		event.preventDefault();
	};

	createDescription(resource) {
		switch (resource.className) {
		case 'ConnectorConfiguration':
			return ``;
		case 'ConsumerConfiguration':
			return ``;
		case 'ProducerConfiguration':
			return ``;
		default:
			return `Contains url(${resource.titleImage || 'images/preview.png'})`;
		}
	}

	getImageByResource(resource) {
		if (!resource) {
			return `url('images/preview.png')`;
		}

		switch (resource.className) {
			case 'ConnectorConfiguration':
				return `url(${resource.titleImage || 'images/connector.png'})`;
			case 'ConsumerConfiguration':
				return `url(${resource.titleImage || 'images/consumer.png'})`;
			case 'ProducerConfiguration':
				return `url(${resource.titleImage || 'images/producer.png'})`;
			default:
				return `url(${resource.titleImage || 'images/preview.png'})`;
		}
	}

	getTiles(resources, columns) {
		const {
			menuOptions,
			label,
			icon,
			titleAttribute,
			onMenuSelect,
			onChecked,
			showControlButtons,
			disabled
		} = this.props;
		let cnt = 0;
		const result = [];

		resources.some((resource) => {
			if (columns !== undefined && cnt >= columns) {
				return true;
			}
			cnt += 1;
			result.push (
			<GridListTile
				key={`${label.key || label}-${resource.id}`}
				cols={1}
				spacing={5}
				style={{
					height: 'auto',
					width: '330px'
				}}
			>
				<Card
					elevation={2}
					square
					style={{
						margin: '3px'
					}}
				>
					<CardContent
						style={{
							cursor: 'pointer',
							padding: '0px'
						}}
						onContextMenu={(event) => this.handleContextMenu(event, resource)}
					>
						{!onChecked ? null : (
							<div
								style={{
									float: 'right',
									position: 'relative',
									left: '25px',
									top: '130px'
								}}
							>
								<Checkbox
									color="default"
									value="checkedG"
									checked={this.state.checked.includes(resource.id)}
									onChange={this.handleChecked(resource.id)}
									disabled={disabled || resource.protected}
								/>
							</div>
						)}
						<div>
							<div
								onClick={() => this.handleOpenClick(resource)}
								style={{
									width: '300px',
									height: '155px',
									backgroundImage: this.getImageByResource(resource),
									backgroundSize: '300px 155px'
								}}
							/>
							<div
								style={{
									borderTop: '2px solid lightgrey',
									display: 'flex',
									alignItems: 'baseline',
									justifyContent: 'space-between',
									padding: '3px 10px 0px 10px'
								}}
								onClick={() => this.handleOpenClick(resource)}
							>
								<Typography
									component="div"
									style={{
										textOverflow: 'ellipsis',
										fontSize: '8pt',
										fontWeight: 'bold',
										color: Colors.lightBlue[800],
										overflow: 'hidden',
										maxWidth: '200px'
									}}
								>
									{jsonpath.query(resource, titleAttribute)}
								</Typography>
								<Typography
									component="div"
									color="textSecondary"
									style={{
										textOverflow: 'ellipsis',
										overflow: 'hidden',
										maxWidth: '130px',
										fontSize: '7pt'
									}}
								>
									{jsonpath.query(resource, 'lastModified_formatted')}
								</Typography>
							</div>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									padding: '0px 10px 0px 10px',
									height: '45px'
								}}
							>
								<Typography
									component="div"
									color="textSecondary"
									onClick={() => this.handleOpenClick(resource)}
									style={{
										textOverflow: 'ellipsis',
										overflow: 'hidden',
										maxWidth: '130px',
										fontSize: '7pt'
									}}
								>
									{jsonpath.query(resource, 'description').length
										? jsonpath.query(resource, 'description')
										: this.createDescription}
								</Typography>
								<div
									style={{
										marginTop: '8px',
										marginRight: '-8px'
									}}
								>
									<ResourceCardHeader
										{...this.props}
										handleClicked={onMenuSelect}
										resource={resource}
										titleAttribute={titleAttribute}
										headerIcons={this.props.headerIcons}
										icon={icon}
										menuOptions={menuOptions}
										onMenuSelect={onMenuSelect}
										titleMaxLength={15}
										disabled={!showControlButtons || disabled}
									/>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</GridListTile>)
			return false;
		});

		return result;
	}

	handleSort = (event, sortedResources, sortQuery) => {
		this.setState({
			// filteredResources: sortedResources,
			sortQuery
		});
		localStorage.setItem(PREF_KEY_SORTQUERY, sortQuery);
	};

	render() {
		const {
			recent,
			resources,
		} = this.props;

		const resGrid = document.getElementById('resGrid');
		let width = resGrid ? resGrid.clientWidth - 1 : 500;
		const resList = document.getElementById('combinedResourceList');
		const resListWidth = resList ? resList.clientWidth : 500;
		if (resListWidth - width < 2) {
			width -= 20;
		}

		const sortQuery = localStorage.getItem(PREF_KEY_SORTQUERY) || this.state.sortQuery;
		const sortFields = ['name', 'lastModified', 'state'];
		const sortObj = SortSelector.parseSortQuery(sortQuery);
		const filteredResources = SortSelector.sort(resources, sortQuery, this.props.filter);
		const columns  = Math.floor(width / 330);
		return (
			<div
				id="resGrid"
				style={{
					height: '100%',
					overflowY: 'auto',
				}}
			>
				<div
					style={{
						marginLeft: `${Math.max(0, Math.floor((width - columns * 330) / 2))}px`,
						marginRight: `${Math.max(0, Math.floor((width - columns * 330) / 2))}px`
					}}
				>
					{recent ? [
					<div
						style={{
							marginTop: '15px',
						}}
					>
						<Typography variant='body1'>Recently Modified</Typography>
					</div>,
					<GridList
						ref={this.gridRef}
						cols={5}
						id="recentGrid"
						spacing={25}
						style={{
							margin: '0px',
						}}
					>
						{!recent ? null : this.getTiles(recent, columns)}
					</GridList>,
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
						}}
					>
						<div
							style={{
								marginTop: '5px',
							}}
						>
							<Typography variant='body1'>All Apps and Services</Typography>
						</div>
						<div
							style={{
								display: 'flex',
								flexFlow: 'row',
							}}
						>
							<SortSelector
								onSort={this.handleSort}
								getResources={this.getFilteredResources}
								sortFields={sortFields}
								withFilter={false}
								defaultSortBy={sortObj.sortBy}
								defaultSortDir={sortObj.sortDir}
							/>
						</div>
					</div> ] : null}
					<GridList
						ref={this.gridRef}
						cols={5}
						id="coreGrid"
						spacing={25}
						style={{
							margin: '0px',
						}}
					>
						{!resources ? null : this.getTiles(filteredResources)}
					</GridList>
				</div>
			</div>
		);
	}
}

export default withStyles(styles, { withTheme: true })(ResourcesGrid);
