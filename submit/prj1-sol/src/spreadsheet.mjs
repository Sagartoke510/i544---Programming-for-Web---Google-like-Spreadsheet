import parse from "./expr-parser.mjs";
import AppError from "./app-error.mjs";
import { cellRefToCellId } from "./util.mjs";

//use for development only
import { inspect } from "util";

export default class Spreadsheet {
  //factory method
  static async make() {
    return new Spreadsheet();
  }

  cells = {};

  constructor() {
    //@TODO
  }

  /** Set cell with id baseCellId to result of evaluating formula
   *  specified by the string expr.  Update all cells which are
   *  directly or indirectly dependent on the base cell.  Return an
   *  object mapping the id's of all dependent cells to their updated
   *  values.  User errors must be reported by throwing a suitable
   *  AppError object having code property set to `SYNTAX` for a
   *  syntax error and `CIRCULAR_REF` for a circular reference
   *  and message property set to a suitable error message.
   */
  async eval(baseCellId, expr) {
    const updates = {};
    //@TODO
    let astForm;

    astForm = parse(expr);

    if (!(baseCellId in this.cells)) {
      this.cells[baseCellId] = new CellInfo(baseCellId, this);
    }

    for (let dep in this.cells[baseCellId].inWardDependents)
      this.cells[dep].dependents.delete(baseCellId);
    this.cells[baseCellId].inWardDependents = new Set();

    this.cells[baseCellId].expr = expr.trim();
    this.cells[baseCellId].astForm = astForm;
    let val = this.evalAstForm(astForm, baseCellId);
    this.cells[baseCellId].value = val;

    // this.cells[baseCellId].dependents = expr.split(/\*|\+|\-|\\|%/);
    this.cells[baseCellId].dependents.forEach((e) => {
      this.cells[e].value = this.evalAstForm(this.cells[e].astForm);
      updates[e] = this.cells[e].value;
    });
    /*for(const c in this.cells){
      if(this.cells[c].dependents.find(e=>e.trim()===baseCellId)){
        this.cells[c].value = this.evalAstForm(this.cells[c].astForm);
        updates[c] = this.cells[c].value;
      }
    }
    */
    //console.log(inspect(astForm, false, Infinity));
    updates[baseCellId] = val;
    return updates;
  }

  //@TODO add methods
  evalAstForm(astForm, baseCellId) {
    switch (astForm.type) {
      case "num":
        return astForm.value;
      case "app":
        return astForm.kids.length === 1
          ? FNS[astForm.fn](this.evalAstForm(astForm.kids[0], baseCellId))
          : astForm.kids.length > 1
          ? FNS[astForm.fn](
              this.evalAstForm(astForm.kids[0], baseCellId),
              this.evalAstForm(astForm.kids[1], baseCellId)
            )
          : null;

      case "ref":
        let cellId = cellRefToCellId(astForm.toString());
        if (!(cellId in this.cells)) {
          this.cells[cellId] = new CellInfo(cellId, this);
          this.cells[cellId].ast = astForm;
          this.cells[cellId].expr = 0;
          this.cells[cellId].value = 0;
        }
        let refResult = this.cells[cellId];
        // refResult.dependents.add(baseCellId);
        refResult.addDependent(baseCellId);
        return refResult === undefined ? 0 : refResult.value;
    }
  }
}

//Map fn property of Ast type === 'app' to corresponding function.
const FNS = {
  "+": (a, b) => a + b,
  "-": (a, b = null) => (b === null ? -a : a - b),
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
  min: (...args) => Math.min(...args),
  max: (...args) => Math.max(...args),
};

//@TODO add other classes, functions, constants etc as needed

class CellInfo {
  constructor(baseCellId, sheet) {
    this.baseCellId = baseCellId;
    this.expr;
    this.value = 0;
    this.dependents = new Set();
    this.inWardDependents = new Set();
    this.sheet = sheet;
    this.ast;
  }
  addDependent(id) {
    if (!id) return;
    this.validateDependents(id);
    this.dependents.add(id);
    this.sheet.cells[id].inWardDependents.add(this.baseCellId);
  }
  validateDependents(id) {
    if (
      id === this.baseCellId ||
      this.sheet.cells[id].dependents.has(this.baseCellId)
    )
      
      throw new AppError('CIRCULAR_REF',"circular dependency for " + id);
    this.dependents.forEach((dep) => {
      if (id !== dep) this.sheet.cells[dep].validateDependents(id);
    });
  }
}
