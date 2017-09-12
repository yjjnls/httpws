
'use strict';



class A {
	constructor( id ){
		console.log("\n+++>",this);
		console.log("\nA: id=",id);
		console.log("\nA: this._onB=",this._onB);
		this._onB("\n----A----");
		console.log("\n--->",this);
	}
	_onB(where){
		console.log(where," (A)>", this)
		
	}
}

class B extends A {
	
	constructor( id ) {
		super(id);
		console.log("\nB: id=",id);
		console.log("\nA: this._onB=",this._onB);
		this._onB("\n----B----");
	}
	
	_onB(where){
		console.log(where,"\n (B)>", this)
		var a1 = new A("InB");
		
		
	}
}


var b=new B(11);
b._onB("global");