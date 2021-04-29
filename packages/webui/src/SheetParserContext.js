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
import JSG from '@cedalo/jsg-ui';
import { BinaryOperator, BoolOperator, Operation, IdentifierOperand, Term } from '@cedalo/parser';


const { GraphParserContext } = JSG;

// eslint-disable-next-line eqeqeq
Operation.register(new BoolOperator('<>', (left, right) => left != right), 4); // we need a sheet-parser module!!
Operation.register(new BinaryOperator('#', (/* left, right */) => '#CALC'), 12);

const isFunctionParam = (node, parent) =>
	parent && parent.type === 'function' && (node.type === 'string');


const keepParserFunctions = (keep, functions) => keep.reduce((acc, name) => ({ ...acc, [name]: functions[name] }), {});

export default class SheetParserContext extends GraphParserContext {
	constructor(functionNames = []) {
		super();
		this.strict = true;
		const sheetFunctions = functionNames.reduce((acc, name) => ({ ...acc, [name]: () => '#CALC' }), {});
		// DL-1587: keep some parser defined functions => NOTE: simply keeping all parser functions didn't work! why???
		const parserFunctions = keepParserFunctions(['MIN', 'MAX'], this.functions);
		this.functions = Object.assign({}, this.functions, sheetFunctions, parserFunctions);
	}

	// we may need a sheet-parser module!!
	createIdentifierTerm(node, parent) {
		// parent has a dot reference:
		return parent && parent.operator === '#'
			? new Term(new IdentifierOperand(node.value))
			: super.createIdentifierTerm(node, parent);
	}

	createReferenceTerm(node, parent) {
		return (isFunctionParam(node, parent)) ? undefined : super.createReferenceTerm(node);
	}
}
