import { Injectable } from '@angular/core';
import * as lucene from 'lucene';
import { AST } from 'lucene';
import { FoodInfo } from '../models/food-info';

interface Conditions {
  [term: string]: Condition;
}

declare type Condition = (field: string, data: FoodInfo) => boolean;

export declare type FilterFunction = (data: FoodInfo) => boolean;

const FepTypes = [ 'str', 'agi', 'int', 'con', 'prc', 'cha', 'dex', 'wil', 'psy' ];
const Operators = [ '>=', '>', '<=', '<' ];

@Injectable({ providedIn: 'root' })
export class QueryService {
  private conditions: Conditions = {
    'name': (field, data) => {
      return data.itemName.toLowerCase().includes(field.toLowerCase());
    },
    'from': (field, data) =>  {
      return !!data.ingredients.find(it => it.name.toLowerCase().includes(field.toLowerCase()));
    }
  };

  public buildFilterFunction(query: string): FilterFunction {
    try {
      const ast = lucene.parse(query);
      return this.conditionByAST(ast);
    } catch (e) {
    }
    return function() { return true };
  }

  private conditionByAST(ast: AST): FilterFunction {
    if ('right' in ast) {
      // Binary AST
      const left = this.conditionByASTOrNode(ast.left);
      const right = this.conditionByASTOrNode(ast.right);

      // Calculate result
      switch (ast.operator) {
        case '<implicit>': // Default operator is AND
        case 'AND':
          return function(data) { return left(data) && right(data) };
        case 'OR':
          return function(data) { return left(data) || right(data) };
        case 'AND NOT':
          return function(data) { return left(data) && !right(data) };
        case 'OR NOT':
          return function(data) { return left(data) || !right(data) };
        default:
          console.warn('Undefined operator', ast);
          return function() { return true };
      }
    } else {
      // Left-only AST
      return this.conditionByNode(ast.left);
    }
  }

  private conditionByASTOrNode(element: AST | lucene.Node): FilterFunction {
    if ('left' in element) {
      // AST
      return this.conditionByAST(element);
    } else {
      // NODE
      return this.conditionByNode(element);
    }
  }

  private conditionByNode(node: lucene.Node): FilterFunction {
    // both field and term should be defined
    let field = node.field?.trim();
    const term = node.term?.trim();

    if (field.length && term.length && field !== '<implicit>') {
      let reverse = false;
      if (field.startsWith('-')) {
        field = field.slice(1);
        reverse = true;
      }

      const condition = this.conditions[field];

      if (condition) {
        return this.reverse((data) => condition(term, data), reverse);
      }

      // Check for fep-based conditions
      const fepBased = FepTypes.find(it => field.startsWith(it));
      if (fepBased) {
        return this.reverse(this.fepBasedCondition(field, term), reverse);
      }
    }

    // Undefined condition do not restrict filtering
    return function() { return true };
  }

  private fepBasedCondition(field: string, term: string): FilterFunction {
    const operator = Operators.find(it => term.startsWith(it));
    if (operator) {
      const filterValue = parseFloat(term.slice(operator.length));
      switch (operator) {
        case '>': return (data) => data.fepBreakdown[field] > filterValue;
        case '>=': return (data) => data.fepBreakdown[field] >= filterValue;
        case '<': return (data) => data.fepBreakdown[field] < filterValue;
        case '<=': return (data) => data.fepBreakdown[field] <= filterValue;
      }
    } else {
      // Default operator is >=
      const filterValue = parseFloat(term);
      return (data) => data.fepBreakdown[field] >= filterValue;
    }
  }

  private reverse(func: FilterFunction, shouldReverse: boolean): FilterFunction {
    return shouldReverse ? (data) => !func(data) : func;
  }
}
