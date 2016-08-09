/************************************************************************
  This file is based on Steve Cheng's code. The original code is to
  generate MLL format from Latex format. It has been changed significantly
  for some bug fix such as single digit log and power functions, and
  to serve the purpose of generating Kinetic Input format strings.

  laTeXToMathML - this is the main function of this file.
    It converts the input Latex string to a MathML string.

  Nick Feng     1/9/2012
  D. Galarneau  8/20/2014  -- Pruned out KB Internal Format code
  Nick Feng     9/11/2014  -- made the conversion of MathML work.
/***********************************************************************/
;(function() {

latexToMathML = {};

//=============================================================
//  The entrance function:
//  input: strLatex - a string in Latex format.
//  return: a translated string in MathML format.
//=============================================================
latexToMathML.translate = function (strLatex)
{
//    for(var j=0; j < arguments.length; ++j)
//    {
        //var input = arguments[j];

        var tokens = {};

        tokens.list = tokenize_latex_math(strLatex); //input); // list is an array of takens
        tokens.list.push(null);
        tokens.index = 0;
        tokens.closeBracket = 0;
        var mathml = v_subExprChainToMathml(tokens, {});

        resetPrint();
        strMl += ('<math>');
        serialize_mathml(mathml, 1);
        strMl += ('</math>');
//    }

    return postClean(strMl);
}

//=============================================================
// post cleaning:
//=============================================================
postClean = function(str)
{
    // ---------------------------------------------
    // combine the seperated letters into two letter groups:
//    var patt1 = /<mi>(\w)<\/mi><mo>&#8290;<\/mo><mi>(\w)<\/mi>(<mo>&#8290;<\/mo>)*/g;
/*    if(patt1.test(str))
    {
        str = str.replace(patt1, "<mi>$1$2</mi>");

        // combine the two letter groups into one:
        var patt2 = /<mi>(\w*?)<\/mi><mi>(\w*?)<\/mi>/g;
        while (patt2.test(str))
            str = str.replace(patt2, "<mi>$1$2</mi>");
    }
    // ---------------------------------------------
*//*
    for (var i=str.length; i>=0; i--)
        if (str.charCodeAt(i) >= 0x100){
            var strLt = str.substr(0,i);
            var strRt = str.substr(i+1);
            str = strLt + "&#x" + str.charCodeAt(i).toString(16) + strRt;
        }
*/
    str = str.replace(/<mn><\/mn>/g, "");
    return str;
}

//=============================================================
//=============================================================
function PlainXMLNode(tag)
{
  this.tag = tag;
  this.content = [];    // array
  this.attrs = {};      // object
}

/****************************************************************
 Inputs (explicit):
    tag - tag for the new node.
    num_attrs - number of display attribute pairs for this node.

 Inputs (implicit - passed in through the arguments):
    attribute pairs - should be exact number of pairs specified
                    by num_attrs.
 content:
    zero or more content elements.

 Return: a new node with tag and content elements.
****************************************************************/
function resultElement(tag) //, num_attrs)
{
	var node = new PlainXMLNode(tag);
	for(var k=1; // start with 1 to bypass the tag
		k < arguments.length; k++) {
		if(arguments[k] != null)
            node.content.push(arguments[k]); // expand array of content
	}

	return node;
}

//================================================
//================================================
function resultIntoNode(node) //, num_attrs)
{
   for(var k=1; // start with 1 to bypass the node
       k < arguments.length; k++) {
       if(arguments[k] != null)
            node.content.push(arguments[k]); // expand array of content
  }

  return node;
}

// attach child node at the end of nodes:
//
function resultElement_append(parent, child)
{
    if(parent != null && child != null) {
        parent.content.push(child);
    }
}

// insert child node before the next node
//
function resultElement_prepend(parent, child, next)
{
    if(next == null)
        resultElement_append(parent, child);
    else
        if(parent != null && child != null)
    {
        // insert child node before the next node:
        for(var i = 0; i < parent.content.length; i++)
        {
            if(parent.content[i] == next)
            {
                parent.content.splice(i, 0, child);
                return;
            }
       }
   }
}

function result_set_attr(elem, attr, value)
{
    if(elem != null && attr != null) {
        if(value != null)
            elem.attrs[attr] = value;
        else
            delete elem.attrs[attr];
    }
}

function result_append_attr(elem, attr, value)
{
    if(elem != null && attr != null) {
        if(elem.attrs[attr] == null)
            elem.attrs[attr] = value;
        else
            elem.attrs[attr] += value;
    }
}

/*
if(!this.GM_getValue) {
  this.GM_getValue = function(key, value) { return value; }
  this.GM_log = function() {}
}
if(this.GM_registerMenuCommand) {
  GM_registerMenuCommand("Enable native display of math images",
    function() {
      GM_setValue("patch-images", true);
      do_patch_images = true;
      patch_element(document.documentElement);
    });
  GM_registerMenuCommand("Disable native display of math images",
    function() {
      GM_setValue("patch-images", false);
    });
}
*/

//const
var char_map = {
  'script': [
    '\uEF35', '\u212C', '\uEF36', '\uEF37', '\u2130', '\u2131',
    '\uEF38', '\u210B', '\u2110', '\uEF39', '\uEF3A', '\u2112',
    '\u2133', '\uEF3B', '\uEF3C', '\uEF3D', '\uEF3E', '\u211B',
    '\uEF3F', '\uEF40', '\uEF41', '\uEF42', '\uEF43', '\uEF44',
    '\uEF45', '\uEF46' ],

  'fraktur': [
    '\uEF5D', '\uEF5E', '\u212D', '\uEF5F', '\uEF60', '\uEF61',
    '\uEF62', '\u210C', '\u2111', '\uEF63', '\uEF64', '\uEF65',
    '\uEF66', '\uEF67', '\uEF68', '\uEF69', '\uEF6A', '\u211C',
    '\uEF6B', '\uEF6C', '\uEF6D', '\uEF6E', '\uEF6F', '\uEF70',
    '\uEF71', '\u2128' ],

  'double-struck': [
    '\uEF8C', '\uEF8D', '\u2102', '\uEF8E', '\uEF8F', '\uEF90',
    '\uEF91', '\u210D', '\uEF92', '\uEF93', '\uEF94', '\uEF95',
    '\uEF96', '\u2115', '\uEF97', '\u2119', '\u211A', '\u211D',
    '\uEF98', '\uEF99', '\uEF9A', '\uEF9B', '\uEF9C', '\uEF9D',
    '\uEF9E', '\u2124' ]
};

//const
var uppercase_re = /[A-Z]/;

function fix_mathvariant(node, style)
{
  if(node.nodeType == node.TEXT_NODE) {
    if(style != null && style != '' && style in char_map) {
      node.data = node.data.replace(uppercase_re,
        function(s) { return char_map[style][s.charCodeAt(0)-65] });
    }
  } else if(node.nodeType == node.ELEMENT_NODE) {
    var new_style = node.getAttribute('mathvariant');
    if(new_style != null && new_style != '')
      style = new_style;

    for(var i=0; i < node.childNodes.length; i++)
      fix_mathvariant(node.childNodes.item(i), style);
  }
}

var g_punctAndSapce
= { "\\quad" : "\u2003" ,
"\\qquad" : "\u2003\u2003" ,
"\\thickspace" : "\u2002" ,
"\\;" : "\u2002" ,
"\\medspace" : "\u2005" ,
"\\:" : "\u2005" ,
"\\thinspace" : "\u2004" ,
"\\," : "\u2004" ,
"\\!" : "\u200b" ,
"." : "." ,
";" : ";" ,
"?" : "?" ,
"\\qedsymbol" : "\u25a0"
};

var g_leftDelimiters
= { "(" : "(" ,
"[" : "[" ,
"\\{" : "{" ,
"\\lgroup" : "(" ,
"\\lbrace" : "{" ,
"\\lvert" : "|" ,
"\\lVert" : "\u2016" ,
"\\lceil" : "\u2308" ,
"\\lfloor" : "\u230a" ,
"\\lmoustache" : "\u23b0" ,
"\\langle" : "\u2329"
};

var g_rightDelimiters
= { ")" : ")" ,
"]" : "]" ,
"\\}" : "}" ,
"\\rbrace" : "}" ,
"\\rgroup" : ")" ,
"\\rvert" : "|" ,
"\\rVert" : "\u2016" ,
"\\rceil" : "\u2309" ,
"\\rfloor" : "\u230b" ,
"\\rmoustache" : "\u23b1" ,
"\\rangle" : "\u232a"
};

var g_operatorSymbols
= { "\\amalg" : "\u2a3f" ,
"\\ast" : "*" ,
"\\ast" : "\u2217" ,
"\\barwedge" : "\u22bc" ,
"\\barwedge" : "\u2305" ,
"\\bigcirc" : "\u25cb" ,
"\\bigtriangledown" : "\u25bd" ,
"\\bigtriangleup" : "\u25b3" ,
"\\boxdot" : "\u22a1" ,
"\\boxminus" : "\u229f" ,
"\\boxplus" : "\u229e" ,
"\\boxtimes" : "\u22a0" ,
"\\bullet" : "\u2022" ,
"\\bullet" : "\u2219",
"\\cap" : "\u2229" ,
"\\Cap" : "\u22d2" ,
"\\cdot" : "\u22c5",
"\\centerdot" : "\u00b7" ,
"\\circ" : "\u2218" ,
"\\circledast" : "\u229b" ,
"\\circledcirc" : "\u229a" ,
"\\circleddash" : "\u229d" ,
"\\cup" : "\u222a" ,
"\\Cup" : "\u22d3" ,
"\\curlyvee" : "\u22ce" ,
"\\curlywedge" : "\u22cf" ,
"\\dagger" : "\u2020" ,
"\\ddagger" : "\u2021" ,
"\\diamond" : "\u22c4" ,
"\\div" : "/",                  //"\u00f7" ,
"\\divideontimes" : "\u22c7" ,
"\\dotplus" : "\u2214" ,
"\\doublebarwedge" : "\u2306" ,
"\\doublecap" : "\u22d2" ,
"\\doublecup" : "\u22d3" ,
"\\gtrdot" : "\u22d7" ,
"\\intercal" : "\u22ba" ,
"\\land" : "\u2227" ,
"\\leftthreetimes" : "\u22cb" ,
"\\lessdot" : "\u22d6" ,
"\\lor" :  "\u2228" ,
"\\ltimes" : "\u22c9" ,
"\\mp" : "\u2213" ,
"\\odot" : "\u2299" ,
"\\ominus" : "\u2296" ,
"\\oplus" : "\u2295" ,
"\\oslash" : "\u2298" ,
"\\otimes" : "\u2297" ,
"\\pm" : "\u00b1",
"\\rightthreetimes" : "\u22cc" ,
"\\rtimes" : "\u22ca" ,
"\\setminus" : "\u2216" ,
"\\smallsetminus" : "\u2216" ,
"\\sqcap" : "\u2293" ,
"\\sqcup" : "\u2294" ,
"\\star" : "\u22c6" ,
"\\times" : "\u00d7",
"\\triangleleft" : "\u25c1" ,
"\\triangleright" : "\u25b7" ,
"\\uplus" : "\u228e" ,
"\\vee" : "\u2228" ,
"\\veebar" : "\u22bb" ,
"\\veebar" : "\u2a61" ,
"\\wedge" :  "\u2227" ,
"\\wr" : "\u2240" ,
"+" : "+" ,
//"-" : "\u2212", // also is &#8722; NF 9/12/2014 - do not convert!
"*" : "*" ,
"," : "," ,
"/" : "\u2215" ,
":" : ":" ,
"\\colon" : ":" ,
"|" : "|" ,
"\\vert" : "|" ,
"\\Vert" : "\u2016" ,
"\\|" : "\u2016" ,
"\\backslash" : "\\" ,
"'" : "\u2032" ,
"\\#" : "#" ,
"\\bmod" : "mod" ,
"\\mod" : "mod" ,
"\\downarrow" : "\u2193" ,
"\\Downarrow" : "\u21d3" ,
"\\uparrow" : "\u2191" ,
"\\Uparrow" : "\u21d1" ,
"\\updownarrow" : "\u2195" ,
"\\Updownarrow" : "\u21d5" ,
"\\bigcap" : "\u22c2" ,
"\\bigcup" : "\u22c3" ,
"\\bigodot" : "\u2a00" ,
"\\bigoplus" : "\u2a01" ,
"\\bigotimes" : "\u2a02" ,
"\\bigsqcup" : "\u2a06" ,
"\\biguplus" : "\u2a04" ,
"\\bigvee" : "\u22c1" ,
"\\bigwedge" : "\u22c0" ,
"\\coprod" : "\u2210" ,
"\\prod" : "\u220f" ,
"\\sum" : "\u2211" ,
"\\int" : "\u222b" ,
"\\smallint" : "\u222b" ,
"\\oint" : "\u222e" ,
"\\angle" : "\u2220" ,
"\\backprime" : "\u2035" ,
"\\bigstar" : "\u2605" ,
"\\blacklozenge" : "\u29eb" ,
"\\blacksquare" : "\u25a0" ,
"\\blacksquare" : "\u25aa" ,
"\\blacktriangle" : "\u25b4" ,
"\\blacktriangledown" : "\u25be" ,
"\\bot" : "\u22a5" ,
"\\clubsuit" : "\u2663" ,
"\\diagdown" : "\u2572" ,
"\\diagup" : "\u2571" ,
"\\diamondsuit" : "\u2662" ,
"\\emptyset" : "\u2205" ,
"\\exists" : "\u2203" ,
"\\flat" : "\u266d" ,
"\\forall" : "\u2200" ,
"\\heartsuit" : "\u2661" ,
"\\infty" : "\u221e" ,
"\\lnot" : "\u00ac" ,
"\\lozenge" : "\u25ca" ,
"\\measuredangle" : "\u2221" ,
"\\nabla" : "\u2207" ,
"\\natural" : "\u266e" ,
"\\neg" : "\u00ac" ,
"\\nexists" : "\u2204" ,
"\\prime" : "\u2032" ,
"\\sharp" : "\u266f" ,
"\\spadesuit" : "\u2660" ,
"\\sphericalangle" : "\u2222" ,
"\\square" : "\u25a1" ,
"\\surd" : "\u221a" ,
"\\top" : "\u22a4" ,
"\\triangle" : "\u25b5" ,
"\\triangledown" : "\u25bf" ,
"\\varnothing" : "\u2205" ,
"\\aleph" : "\u2135" ,
"\\Bbbk" : "\u1d55C" ,
"\\beth" : "\u2136" ,
"\\circledS" : "\u24c8" ,
"\\complement" : "\u2201" ,
"\\daleth" : "\u2138" ,
"\\ell" : "\u2113" ,
"\\eth" : "\u00f0" ,
"\\Finv" : "\u2132" ,
"\\Game" : "\u2141" ,
"\\gimel" : "\u2137" ,
"\\hbar" : "\u210f" ,
"\\hslash" : "\u210f" ,
"\\Im" : "\u2111" ,
"\\mho" : "\u2127" ,
"\\partial" : "\u2202" ,
"\\Re" : "\u211c" ,
"\\wp" : "\u2118"
};

var g_relationSymbols
= { "=" : "=" ,
"<" : "<" ,
">" : ">" ,
"\\approx" : "\u2248" ,
"\\approxeq" : "\u224a" ,
"\\asymp" : "\u224d" ,
"\\backsim" : "\u223d" ,
"\\backsimeq" : "\u22cd" ,
"\\bumpeq" : "\u224f" ,
"\\Bumpeq" : "\u224e" ,
"\\circeq" : "\u2257" ,
"\\cong" : "\u2245" ,
"\\curlyeqprec" : "\u22de" ,
"\\curlyeqsucc" : "\u22df" ,
"\\doteq" : "\u2250" ,
"\\doteqdot" : "\u2251" ,
"\\eqcirc" : "\u2256" ,
"\\eqsim" : "\u2242" ,
"\\eqslantgtr" : "\u2a96" ,
"\\eqslantless" : "\u2a95" ,
"\\equiv" : "\u2261" ,
"\\fallingdotseq" : "\u2252" ,
"\\ge" : "\u2265",
"\\geq" : "\u2265",
"\\geqq" : "\u2267" ,
"\\geqslant" : "\u2a7e" ,
"\\gg" : "\u226b" ,
"\\gg" : "\u2aa2" ,
"\\ggg" : "\u22d9" ,
"\\gggtr" : "\u22d9" ,
"\\gnapprox" : "\u2a8a" ,
"\\gneq" : "\u2a88" ,
"\\gneqq" : "\u2269" ,
"\\gnsim" : "\u22e7" ,
"\\gtrapprox" : "\u2a86" ,
"\\gtreqless" : "\u22db" ,
"\\gtreqqless" : "\u2a8c" ,
"\\gtrless" : "\u2277" ,
"\\gtrsim" : "\u2273" ,
"\\gvertneqq" : "\u2269" ,
"\\le" : "\u2264",
"\\leq" : "\u2264",
"\\leqq" : "\u2266" ,
"\\leqslant" : "\u2a7d" ,
"\\lessapprox" : "\u2a85" ,
"\\lesseqgtr" : "\u22da" ,
"\\lesseqqgtr" : "\u2a8b" ,
"\\lessgtr" : "\u2276" ,
"\\lesssim" : "\u2272" ,
"\\ll" : "\u226a" ,
"\\llless" : "\u22d8" ,
"\\lnapprox" : "\u2a89" ,
"\\lneq" : "\u2a87" ,
"\\lneqq" : "\u2268" ,
"\\lnsim" : "\u22e6" ,
"\\lvertneqq" : "\u2268" ,
"\\ncong" : "\u2247" ,
"\\ne" : "\u2260" ,
"\\neq" : "\u2260" ,
"\\ngeq" : "\u2271" ,
"\\ngeqq" : "\u2267" ,
"\\ngeqslant" : "\u2a7e" ,
"\\ngtr" : "\u226f" ,
"\\nleq" : "\u2270" ,
"\\nleqq" : "\u2266" ,
"\\nleqslant" : "\u2a7d" ,
"\\nless" : "\u226e" ,
"\\nprec" : "\u2280" ,
"\\npreceq" : "\u2aaf" ,
"\\nsim" : "\u2241" ,
"\\nsucc" : "\u2281" ,
"\\nsucceq" : "\u2ab0" ,
"\\prec" : "\u227a" ,
"\\precapprox" : "\u2ab7" ,
"\\preccurlyeq" : "\u227c" ,
"\\preceq" : "\u2aaf" ,
"\\precnapprox" : "\u2ab9" ,
"\\precneqq" : "\u2ab5" ,
"\\precnsim" : "\u22e8" ,
"\\precsim" : "\u227e" ,
"\\risingdotseq" : "\u2253" ,
"\\sim" : "\u223c" ,
"\\simeq" : "\u2243" ,
"\\succ" : "\u227b" ,
"\\succapprox" : "\u2ab8" ,
"\\succcurlyeq" : "\u227d" ,
"\\succeq" : "\u2ab0" ,
"\\succnapprox" : "\u2aba" ,
"\\succneqq" : "\u2ab6" ,
"\\succnsim" : "\u22e9" ,
"\\succsim" : "\u227f" ,
"\\thickapprox" : "\u2248" ,
"\\thicksim" : "\u223c" ,
"\\triangleq" : "\u225c" ,
"\\curvearrowleft" : "\u21b6" ,
"\\curvearrowright" : "\u21b7" ,
"\\downdownarrows" : "\u21ca" ,
"\\downharpoonleft" : "\u21c3" ,
"\\downharpoonright" : "\u21c2" ,
"\\gets" : "\u2190" ,
"\\hookleftarrow" : "\u21a9" ,
"\\hookrightarrow" : "\u21aa" ,
"\\leftarrow" : "\u2190" ,
"\\Leftarrow" : "\u21d0" ,
"\\leftarrowtail" : "\u21a2" ,
"\\leftharpoondown" : "\u21bd" ,
"\\leftharpoonup" : "\u21bc" ,
"\\leftleftarrows" : "\u21c7" ,
"\\leftrightarrow" : "\u2194" ,
"\\leftrightarrows" : "\u21c6" ,
"\\leftrightharpoons" : "\u21cb" ,
"\\leftrightsquigarrow" : "\u21ad" ,
"\\Lleftarrow" : "\u21da" ,
"\\longleftarrow" : "\u27f5" ,
"\\Longleftarrow" : "\u27f8" ,
"\\longleftrightarrow" : "\u27f7" ,
"\\Longleftrightarrow" : "\u27fa" ,
"\\looparrowleft" : "\u21ab" ,
"\\looparrowright" : "\u21ac" ,
"\\Lsh" : "\u21b0" ,
"\\mapsto" : "\u21a6" ,
"\\multimap" : "\u22b8" ,
"\\nearrow" : "\u2197" ,
"\\nleftarrow" : "\u219a" ,
"\\nLeftarrow" : "\u21cd" ,
"\\nleftrightarrow" : "\u21ae" ,
"\\nLeftrightarrow" : "\u21ce" ,
"\\nrightarrow" : "\u219b" ,
"\\nRightarrow" : "\u21cf" ,
"\\nwarrow" : "\u2196" ,
"\\restriction" : "\u21be" ,
"\\rightarrow" : "\u2192" ,
"\\Rightarrow" : "\u21d2" ,
"\\rightarrowtail" : "\u21a3" ,
"\\rightharpoondown" : "\u21c1" ,
"\\rightharpoonup" : "\u21c0" ,
"\\rightleftarrows" : "\u21c4" ,
"\\rightleftharpoons" : "\u21cc" ,
"\\rightrightarrows" : "\u21c9" ,
"\\rightsquigarrow" : "\u219d" ,
"\\Rrightarrow" : "\u21db" ,
"\\Rsh" : "\u21b1" ,
"\\searrow" : "\u2198" ,
"\\swarrow" : "\u2199" ,
"\\to" : "\u2192" ,
"\\twoheadleftarrow" : "\u219e" ,
"\\twoheadrightarrow" : "\u21a0" ,
"\\upharpoonleft" : "\u21bf" ,
"\\upharpoonright" : "\u21be" ,
"\\upuparrows" : "\u21c8" ,
"\\backepsilon" : "\u03f6" ,
"\\because" : "\u2235" ,
"\\between" : "\u226c" ,
"\\blacktriangleleft" : "\u25c0" ,
"\\blacktriangleright" : "\u25b6" ,
"\\bowtie" : "\u22c8" ,
"\\dashv" : "\u22a3" ,
"\\frown" : "\u2323" ,
"\\in" : "\u220a" ,
"\\mid" : "\u2223" ,
"\\models" : "\u22a7" ,
"\\ni" : "\u220b" ,
"\\ni" : "\u220d" ,
"\\nmid" : "\u2224" ,
"\\notin" : "\u2209" ,
"\\nparallel" : "\u2226" ,
"\\nshortmid" : "\u2224" ,
"\\nshortparallel" : "\u2226" ,
"\\nsubseteq" : "\u2286" ,
"\\nsubseteq" : "\u2288" ,
"\\nsubseteqq" : "\u2ac5" ,
"\\nsupseteq" : "\u2287" ,
"\\nsupseteq" : "\u2289" ,
"\\nsupseteqq" : "\u2ac6" ,
"\\ntriangleleft" : "\u22ea" ,
"\\ntrianglelefteq" : "\u22ec" ,
"\\ntriangleright" : "\u22eb" ,
"\\ntrianglerighteq" : "\u22ed" ,
"\\nvdash" : "\u22ac" ,
"\\nvDash" : "\u22ad" ,
"\\nVdash" : "\u22ae" ,
"\\nVDash" : "\u22af" ,
"\\owns" : "\u220d" ,
"\\parallel" : "\u2225" ,
"\\perp" : "\u22a5" ,
"\\pitchfork" : "\u22d4" ,
"\\propto" : "\u221d" ,
"\\shortmid" : "\u2223" ,
"\\shortparallel" : "\u2225" ,
"\\smallfrown" : "\u2322" ,
"\\smallsmile" : "\u2323" ,
"\\smile" : "\u2323" ,
"\\sqsubset" : "\u228f" ,
"\\sqsubseteq" : "\u2291" ,
"\\sqsupset" : "\u2290" ,
"\\sqsupseteq" : "\u2292" ,
"\\subset" : "\u2282" ,
"\\Subset" : "\u22d0" ,
"\\subseteq" : "\u2286" ,
"\\subseteqq" : "\u2ac5" ,
"\\subsetneq" : "\u228a" ,
"\\subsetneqq" : "\u2acb" ,
"\\supset" : "\u2283" ,
"\\Supset" : "\u22d1" ,
"\\supseteq" : "\u2287" ,
"\\supseteqq" : "\u2ac6" ,
"\\supsetneq" : "\u228b" ,
"\\supsetneqq" : "\u2acc" ,
"\\therefore" : "\u2234" ,
"\\trianglelefteq" : "\u22b4" ,
"\\trianglerighteq" : "\u22b5" ,
"\\varpropto" : "\u221d" ,
"\\varsubsetneq" : "\u228a" ,
"\\varsubsetneqq" : "\u2acb" ,
"\\varsupsetneq" : "\u228b" ,
"\\varsupsetneqq" : "\u2acc" ,
"\\vartriangle" : "\u25b5" ,
"\\vartriangleleft" : "\u22b2" ,
"\\vartriangleright" : "\u22b3" ,
"\\vdash" : "\u22a2" ,
"\\vDash" : "\u22a8" ,
"\\Vdash" : "\u22a9" ,
"\\Vvdash" : "\u22aa"
}
;
var g_namedIdentifiers
= { "\\arccos" : "arccos" ,
"\\arcsin" : "arcsin" ,
"\\arctan" : "arctan" ,
"\\arg" : "arg" ,
"\\cos" : "cos" ,
"\\cosh" : "cosh" ,
"\\cot" : "cot" ,
"\\coth" : "coth" ,
"\\csc" : "csc" ,
"\\deg" : "deg" ,
"\\det" : "det" ,
"\\dim" : "dim" ,
"\\exp" : "exp" ,
"\\gcd" : "gcd" ,
"\\hom" : "hom" ,
"\\ker" : "ker" ,
"\\lg" : "lg" ,
"\\ln" : "ln" ,
"\\log" : "log" ,
"\\Pr" : "Pr" ,
"\\sec" : "sec" ,
"\\sin" : "sin" ,
"\\sinh" : "sinh" ,
"\\tan" : "tan" ,
"\\tanh" : "tanh" ,
"\\inf" : "inf" ,
"\\injlim" : "inj lim" ,
"\\lim" : "lim" ,
"\\liminf" : "lim inf" ,
"\\limsup" : "lum sup" ,
"\\max" : "max" ,
"\\min" : "min" ,
"\\projlim" : "proj lim" ,
"\\sup" : "sup" ,
"\\alpha" : "\u03b1" ,
"\\beta" : "\u03b2" ,
"\\chi" : "\u03c7" ,
"\\delta" : "\u03b4" ,
"\\Delta" : "\u0394" ,
"\\digamma" : "\u03dd" ,
"\\epsilon" : "\u03f5" ,
"\\eta" : "\u03b7" ,
"\\gamma" : "\u03b3" ,
"\\Gamma" : "\u0393" ,
"\\iota" : "\u03b9" ,
"\\kappa" : "\u03ba" ,
"\\lambda" : "\u03bb" ,
"\\Lambda" : "\u039b" ,
"\\mu" : "\u03bc" ,
"\\nu" : "\u03bd" ,
"\\omega" : "\u03c9" ,
"\\Omega" : "\u03a9" ,
"\\phi" : "\u03c6" ,
"\\Phi" : "\u03a6" ,
"\\pi" : "\u03c0" ,
"\\Pi" : "\u03a0" ,
"\\psi" : "\u03c8" ,
"\\Psi" : "\u03a8" ,
"\\rho" : "\u03c1" ,
"\\sigma" : "\u03c3" ,
"\\Sigma" : "\u03a3" ,
"\\tau" : "\u03c4" ,
"\\theta" : "\u03b8" ,
"\\Theta" : "\u0398" ,
"\\upsilon" : "\u03c5" ,
"\\Upsilon" : "\u03d2" ,
"\\varepsilon" : "\u03b5" ,
"\\varkappa" : "\u03f0" ,
"\\varphi" : "\u03d5" ,
"\\varpi" : "\u03d6" ,
"\\varrho" : "\u03f1" ,
"\\varsigma" : "\u03c2" ,
"\\vartheta" : "\u03d1" ,
"\\xi" : "\u03be" ,
"\\Xi" : "\u039e" ,
"\\zeta" : "\u03b6" ,
"a" : "a" ,
"b" : "b" ,
"c" : "c" ,
"d" : "d" ,
"e" : "e" ,
"f" : "f" ,
"g" : "g" ,
"h" : "h" ,
"i" : "i" ,
"j" : "j" ,
"k" : "k" ,
"l" : "l" ,
"m" : "m" ,
"n" : "n" ,
"o" : "o" ,
"p" : "p" ,
"q" : "q" ,
"r" : "r" ,
"s" : "s" ,
"t" : "t" ,
"u" : "u" ,
"v" : "v" ,
"w" : "w" ,
"x" : "x" ,
"y" : "y" ,
"z" : "z" ,
"A" : "A" ,
"B" : "B" ,
"C" : "C" ,
"D" : "D" ,
"E" : "E" ,
"F" : "F" ,
"G" : "G" ,
"H" : "H" ,
"I" : "I" ,
"J" : "J" ,
"K" : "K" ,
"L" : "L" ,
"M" : "M" ,
"N" : "N" ,
"O" : "O" ,
"P" : "P" ,
"Q" : "Q" ,
"R" : "R" ,
"S" : "S" ,
"T" : "T" ,
"U" : "U" ,
"V" : "V" ,
"W" : "W" ,
"X" : "X" ,
"Y" : "Y" ,
"Z" : "Z" ,
"\\vdots" : "\u22ee" ,
"\\hdots" : "\u2026" ,
"\\ldots" : "\u2026" ,
"\\dots" : "\u2026" ,
"\\cdots" : "\u00b7\u00b7\u00b7" ,
"\\dotsb" : "\u00b7\u00b7\u00b7" ,
"\\dotsc" : "\u2026" ,
"\\dotsi" : "\u22c5\u22c5\u22c5" ,
"\\dotsm" : "\u22c5\u22c5\u22c5" ,
"\\dotso" : "\u2026" ,
"\\ddots" : "\u22f1"
}
;
var g_wordOperators
= { "\\arccos" : "arccos" ,
"\\arcsin" : "arcsin" ,
"\\arctan" : "arctan" ,
"\\arg" : "arg" ,
"\\cos" : "cos" ,
"\\cosh" : "cosh" ,
"\\cot" : "cot" ,
"\\coth" : "coth" ,
"\\csc" : "csc" ,
"\\deg" : "deg" ,
"\\det" : "det" ,
"\\dim" : "dim" ,
"\\exp" : "exp" ,
"\\gcd" : "gcd" ,
"\\hom" : "hom" ,
"\\ker" : "ker" ,
"\\lg" : "lg" ,
"\\ln" : "ln" ,
"\\log" : "log" ,
"\\Pr" : "Pr" ,
"\\sec" : "sec" ,
"\\sin" : "sin" ,
"\\sinh" : "sinh" ,
"\\tan" : "tan" ,
"\\tanh" : "tanh"
}
;
var g_big_wordOperators
= { "\\inf" : "inf" ,
"\\injlim" : "inj lim" ,
"\\lim" : "lim" ,
"\\liminf" : "lim inf" ,
"\\limsup" : "lum sup" ,
"\\max" : "max" ,
"\\min" : "min" ,
"\\projlim" : "proj lim" ,
"\\sup" : "sup"
}
;
var g_greekLetters
= { "\\alpha" : "\u03b1" ,
"\\beta" : "\u03b2" ,
"\\chi" : "\u03c7" ,
"\\delta" : "\u03b4" ,
"\\Delta" : "\u0394" ,
"\\digamma" : "\u03dd" ,
"\\epsilon" : "\u03f5" ,
"\\eta" : "\u03b7" ,
"\\gamma" : "\u03b3" ,
"\\Gamma" : "\u0393" ,
"\\iota" : "\u03b9" ,
"\\kappa" : "\u03ba" ,
"\\lambda" : "\u03bb" ,
"\\Lambda" : "\u039b" ,
"\\mu" : "\u03bc" ,
"\\nu" : "\u03bd" ,
"\\omega" : "\u03c9" ,
"\\Omega" : "\u03a9" ,
"\\phi" : "\u03c6" ,
"\\Phi" : "\u03a6" ,
"\\pi" : "\u03c0" ,
"\\Pi" : "\u03a0" ,
"\\psi" : "\u03c8" ,
"\\Psi" : "\u03a8" ,
"\\rho" : "\u03c1" ,
"\\sigma" : "\u03c3" ,
"\\Sigma" :"\u03a3" ,
"\\tau" : "\u03c4" ,
"\\theta" : "\u03b8" ,
"\\Theta" : "\u0398" ,
"\\upsilon" : "\u03c5" ,
"\\Upsilon" : "\u03d2" ,
"\\varepsilon" : "\u03b5" ,
"\\varkappa" : "\u03f0" ,
"\\varphi" : "\u03d5" ,
"\\varpi" : "\u03d6" ,
"\\varrho" : "\u03f1" ,
"\\varsigma" : "\u03c2" ,
"\\vartheta" : "\u03d1" ,
"\\xi" : "\u03be" ,
"\\Xi" : "\u039e" ,
"\\zeta" : "\u03b6"
};
// ======================================================
// convert a fraction token to a MathML string
// ======================================================
function v_fractionToMathml (tokens )
{
    var v_numerator = v_pieceToMathml (tokens );
    var v_denominator = v_pieceToMathml (tokens );

    if (!v_numerator || !v_denominator)
        return resultElement( "error" ,0 , -999999 , 1 ) ;

/* ====================== NF 9/10/2014: ======================
   //latex user should taking care of using "(" and ")" already, this code just doubles the effort:

    var v_openBracket = resultElement('mo',0,'(');
    var v_closeBracket = resultElement('mo',0,')');

    if (v_numerator.tag == 'mrow')
    {
        var v_upper = v_numerator;
        v_numerator = resultElement( "mo" ,0 , v_openBracket,
                                    v_upper, v_closeBracket);
    }
 =============================================*/

/*  // the following seems messed the content length for the MathML process and as the result lost the numerator:
    var forwardSlash = (v_denominator.content
                        && (v_denominator.content == '/' || v_denominator.content == "\u2215"));
    if (!forwardSlash) // denominator doesn't have it, so we append it to the numerator:
    {
        var v_divider = resultElement('mtext',0,'/');
        resultElement_append(v_numerator, v_divider);
    }
*/
/* =============== NF 9/10/2014: ===============
    if (v_denominator.tag == 'mrow')
    {
        var v_lower = v_denominator;
        v_denominator = resultElement( "mo" ,0 , v_openBracket,
                                    v_lower, v_closeBracket);
    }
//    else
//        v_denominator = resultElement( "mrow" ,0 , v_denominator) ;
 =============================================*/

    return resultElement( "mfrac" ,0 , v_numerator , v_denominator ) ;
}

// ======================================================
// convert a binomial token to a MathML string
// ======================================================
function v_binomToMathml (tokens )
{
    var v_top = v_pieceToMathml (tokens ) ;

    var v_bottom = v_pieceToMathml (tokens ) ;

    return resultElement( "mrow" ,0 ,
//                          resultElement( "mo" ,0 , "(" ) ,
                          resultElement( "mfrac" , 1, "linethickness",
                                         "0" ,
                                         v_top ,
                                         v_bottom )//,
//                          resultElement( "mo" ,0 , ")" )
                        );
}

// ======================================================
// convert a square root token to a MathML string
// ======================================================
function v_sqrtToMathml (tokens )
{
    var v_index = v_optional_argToMathml (tokens ) ;
    var v_object = v_pieceToMathml (tokens ) ;

/* ============= remove latex to kl insert - NF 9/3/2014 ===========
    var v_sqrt = resultElement( "mtext" ,0 , 'sqrt') ;
    var v_nroot = resultElement( "mtext" ,0 , 'nroot') ;
    var v_beginBracket = resultElement( "mtext" ,0 , '(' ) ;
    var v_comma = resultElement( "mtext" ,0 , ',' ) ;
    var v_endBracket = resultElement( "mtext" ,0 , ')' ) ;
===================================================================*/
    //resultElement_append(v_result, v_endBracket);

    var v_result;
    if( v_index != null ) { // nroot:
//NF 9/3/2014:         v_result = resultElement( "mroot" ,0, v_nroot, v_beginBracket, v_object, v_comma, v_index, v_endBracket );
        v_result = resultElement( "mroot" ,0, v_object, v_index ) ;
    }
    else { // sqrt:
//NF 9/3/2014:         v_result = resultElement( "msqrt" ,0, v_sqrt, v_beginBracket, v_object, v_endBracket);
        v_result = resultElement( "msqrt" ,0, v_object) ;
    }

    return v_result;
}

// ================================================================
// convert a parenthesis token with content to a MathML string
// ================================================================
function v_parenthesized_operator (tokens, v_word )
{
    var v_object = v_pieceToMathml (tokens ) ;

    if( v_word != null ) {
        return resultElement( "mrow" ,0 ,
                              resultElement( "mo" ,0 , "(" ),
                              resultElement( "mo" ,0 , v_word ),
                              v_object,
                              resultElement( "mo" ,0 , ")" )
                            );
    }
    else {
        return resultElement( "mrow" ,0 ,
                              resultElement( "mo" ,0 , "(" ),
                              v_object,
                              resultElement( "mo" ,0 , ")" )
                            );
    }
}

// ================================================================
// ================================================================
function v_operatornameToMathml (tokens ) {
 var v_result = resultElement( "mo" ,0 , tokens.list[tokens.index] ) ;
 tokens.index++;
 return v_result ;
}

// ================================================================
// ================================================================
function v_displaystyleToMathml (tokens ) {
 var v_result = v_subExprChainToMathml (tokens , g_hard_stopTokens
) ;
 return resultElement( "mstyle" , 2
, "displaystyle" , "true" , "scriptlevel" , "0" , v_result ) ;
}

// ================================================================
// ================================================================
function v_displaymathToMathml (tokens ) {
 var v_result = v_subExprChainToMathml (tokens , g_hard_stopTokens
) ;
  v_finish_latex_block (tokens );
 return resultElement( "mstyle" , 2
, "displaystyle" , "true" , "scriptlevel" , "0" , v_result ) ;
}

// ================================================================
// ================================================================
function v_fontToMathml (tokens, v_font_name )
{
    if( tokens.list[tokens.index] != "{" ) {
        var v_result = resultElement( "mi", v_font_name , tokens.list[tokens.index]) ;
    
        if( v_font_name == "normal" )
            result_set_attr(v_result , "fontstyle" , "normal" );

        tokens.index++;
        return v_result ;
    }
    else {
        var v_result = v_pieceToMathml(tokens) ;
        result_set_attr(v_result , "mathvariant" , v_font_name );
        
        if( v_font_name == "normal" )
            result_set_attr(v_result, "fontstyle" , "normal" );
        
        return v_result ;
    }
}

// ================================================================
// ================================================================
function v_old_fontToMathml (tokens , v_font_name )
{
    return resultElement( "mstyle" , 2, "mathvariant" , v_font_name , "fontstyle" ,
                          ( ( v_font_name == "normal" ) ? "normal" : null ) ,
                          v_subExprChainToMathml (tokens , g_hard_stopTokens
) ) ;
}

// ================================================================
// ================================================================
function v_sizeToMathml (tokens , v_min_size , v_max_size ) {
 var v_result = v_pieceToMathml (tokens ) ;
 result_set_attr(
v_result , "minsize" , v_min_size );
 result_set_attr(
v_result , "maxsize" , v_max_size );
 return v_result ;
}

// ================================================================
// ================================================================
function v_accentToMathml (tokens , v_char ) {
 return resultElement( "mover" , 1, "accent" , "true" ,
                        v_pieceToMathml (tokens ) , resultElement( "mo" ,0 , v_char ) ) ;
}

// ================================================================
// ================================================================
function v_matrixToMathml (tokens , v_open_delim , v_close_delim ) {
 var v_mtable = v_matrix_to_mtable (tokens , resultElement( "mtable" ,0) ) ;
 if( ( v_open_delim != null )  ||  ( v_close_delim != null ) ) {
  var v_mrow = resultElement( "mrow" ,0) ;
  if( v_open_delim != null ) {
   resultElement_append( v_mrow , resultElement( "mo" ,0 , v_open_delim ) );
  }
  resultElement_append( v_mrow , v_mtable );
  if( v_close_delim != null ) {
   resultElement_append( v_mrow , resultElement( "mo" ,0 , v_close_delim ) );
  }
  return v_mrow ;
 }
 else {
  return v_mtable ;
 }
}

// ================================================================
// ================================================================
function v_arrayToMathml (tokens ) {
 var v_mtable = resultElement( "mtable" ,0) ;
 if( tokens.list[tokens.index] == "{" ) {
  tokens.index++;
  while( ( tokens.list[tokens.index] != null )  &&  ( tokens.list[tokens.index] != "}" ) ) {
   if( tokens.list[tokens.index] == "c" ) {
    result_append_attr(
v_mtable , "columnalign" , "center " );
   }
   else if( tokens.list[tokens.index] == "l" ) {
    result_append_attr(
v_mtable , "columnalign" , "left " );
   }
   else if( tokens.list[tokens.index] == "r" ) {
    result_append_attr(
v_mtable , "columnalign" , "right " );
   }
   tokens.index++;
  }
  if( tokens.list[tokens.index] != null ) {
   tokens.index++;
  }
 }
 return v_matrix_to_mtable (tokens , v_mtable ) ;
}

// ================================================================
// ================================================================
function v_matrix_to_mtable (tokens , v_mtable ) {
 var v_mtr = resultElement( "mtr" ,0) ;
 var v_mtd = resultElement( "mtd" ,0) ;
 var v_token = tokens.list[tokens.index] ;
 resultElement_append( v_mtable , v_mtr );
 resultElement_append( v_mtr , v_mtd );
 while( ( v_token != null )  &&  ( v_token != "\\end" ) ) {
  if( v_token == "\\\\" ) {
    v_mtr = resultElement( "mtr" ,0) ;
    v_mtd = resultElement( "mtd" ,0) ;
   resultElement_append( v_mtable , v_mtr );
   resultElement_append( v_mtr , v_mtd );
   tokens.index++;
  }
  else if( v_token == "&" ) {
    v_mtd = resultElement( "mtd" ,0) ;
   resultElement_append( v_mtr , v_mtd );
   tokens.index++;
  }
  else {
   resultElement_append( v_mtd , v_subExprChainToMathml (tokens , g_hard_stopTokens
) );
  }
   v_token = tokens.list[tokens.index] ;
 }
  v_finish_latex_block (tokens );
 return v_mtable ;
}

// ================================================================
// ================================================================
function v_overToMathml (tokens , v_char ) {
    return resultElement( "mover" ,0 ,
                          v_pieceToMathml(tokens ),
                          resultElement( "mo" ,0 , v_char ) ) ;
}

// ================================================================
// ================================================================
function v_underToMathml (tokens , v_char ) {
    return resultElement( "munder" ,0 ,
                          v_pieceToMathml(tokens ),
                          resultElement( "mo" ,0 , v_char ) ) ;
}

// ================================================================
// ================================================================
function v_delimiterToMathml (tokens, v_end_command, v_min_size , v_max_size )
{
    var v_mrow = resultElement("mrow") ;

    resultIntoNode( v_mrow, resultElement("mo", v_read_delimiter(tokens)));

    v_subExprChainToMathml(tokens, g_hard_stopTokens, v_mrow);

    if( tokens.list[tokens.index] != v_end_command )
        return v_mrow ;

    tokens.index++; // points to the symbol of end command
    resultIntoNode(v_mrow, resultElement("mo", v_read_delimiter (tokens )));
    return v_mrow ;
}

// ================================================================
// ================================================================
function v_read_delimiter (tokens ) {
 var v_token = tokens.list[tokens.index] ;
 if( v_token == null ) {
  throw "unexpected eof" ;
 }
 else if( v_token == "." ) {
  tokens.index++;
  return "" ;
 }
 else if( v_token == "<" ) {
  tokens.index++;
  return "\u2329" ;
 }
 else if( v_token == ">" ) {
  tokens.index++;
  return "\u232a" ;
 }
 else if( v_token in g_punctAndSapce )
 {
  tokens.index++;
  return g_punctAndSapce[ v_token ] ;
 }
 else if( v_token in g_leftDelimiters) {
  tokens.index++;
  return g_leftDelimiters[ v_token ] ;
 }
 else if( v_token in g_rightDelimiters) {
  tokens.index++;
  return g_rightDelimiters[ v_token ] ;
 }
 else if( ( v_token in g_operatorSymbols
) ) {
  tokens.index++;
  return g_operatorSymbols[ v_token ] ;
 }
 else {
  throw "invalid delimiter" ;
 }
}

// ================================================================
// ================================================================
function v_latex_blockToMathml (tokens ) {
  v_cmd = tokens.list[tokens.index] ;
 if( ( v_cmd in g_tex_environments
) ) {
  tokens.index++;
  return g_tex_environments
[ v_cmd ] (tokens ) ;
 }
 else {
  throw "unknown command" ;
 }
}

// ================================================================
// ================================================================
function v_finish_latex_block (tokens ) {
 if( tokens.list[tokens.index] == null ) {
  throw "unexpected eof" ;
 }
 tokens.index++;
 tokens.index++;
}

// ================================================================
// ================================================================
function v_combiningToMathml (tokens, v_char ) {
    var v_base = tokens.list[tokens.index] ;
    tokens.index++;
    return resultElement("mo", v_base, v_char) ;
}

// ================================================================
// ================================================================
var g_char_escape_codes = { "93" : "#"};

// ================================================================
function v_char_escapeToMathml (tokens ) {
 var v_result = null ;
 if( tokens.list[tokens.index] in g_char_escape_codes) {
   v_result = resultElement("mtext",
                    g_char_escape_codes[ tokens.list[tokens.index] ] ) ;
 }
 else
   v_result = resultElement( "merror","\\char", tokens.list[tokens.index] ) ;

 tokens.index++;
 return v_result ;
}

// ================================================================
// ================================================================
function v_textToMathml (tokens ) {
    if( tokens.list[tokens.index] != "{" )  {
       var v_result = resultElement("mtext", tokens.list[tokens.index] ) ;
       tokens.index++;
       return v_result ;
    }
    tokens.index++;
    var v_result = null ;
    var v_mrow = null ;
    var v_node = null ;
    while( tokens.list[tokens.index] != null ) {
        if(tokens.list[tokens.index] == "}") {
            tokens.index++;
            return v_result ;
        }
        else if( tokens.list[tokens.index] == "$" ) {
            tokens.index++;
            v_node = v_subExprChainToMathml (tokens , g_hard_stopTokens);
            tokens.index++;
        }
        else {
            v_node = resultElement("mtext", tokens.list[tokens.index] ) ;
            tokens.index++;
        }
        if( v_mrow != null )
            resultElement_append( v_mrow , v_node );
        else if( v_result != null ) {
            v_mrow = resultElement("mrow", v_result , v_node ) ;
            v_result = v_mrow ;
        }
        else
            v_result = v_node ;
    }
    return v_result ;
}

// ================================================================
var g_textCommands = { "\\frac" : v_fractionToMathml ,
"\\dfrac" : v_fractionToMathml ,
"\\tfrac" : v_fractionToMathml ,
"\\binom" : v_binomToMathml ,
"\\sqrt" : v_sqrtToMathml ,
"\\operatorname" : v_operatornameToMathml ,
"\\displaystyle" : v_displaystyleToMathml ,
"\\pod" : function(tokens ) { return v_parenthesized_operator (tokens , null ) ; } ,
"\\pmod" : function(tokens ) { return v_parenthesized_operator (tokens , "mod" ) ; } ,
"\\boldsymbol" : function(tokens ) { return v_fontToMathml (tokens , "bold" ) ; } ,
"\\bold" : function(tokens ) { return v_fontToMathml (tokens , "bold" ) ; } ,
"\\Bbb" : function(tokens ) { return v_fontToMathml (tokens , "double-struck" ) ; } ,
"\\mathbb" : function(tokens ) { return v_fontToMathml (tokens , "double-struck" ) ; } ,
"\\mathbbmss" : function(tokens ) { return v_fontToMathml (tokens , "double-struck" ) ; } ,
"\\mathbf" : function(tokens ) { return v_fontToMathml (tokens , "bold" ) ; } ,
"\\mathop" : function(tokens ) { return v_fontToMathml (tokens , "normal" ) ; } ,
"\\mathrm" : function(tokens ) { return v_fontToMathml (tokens , "normal" ) ; } ,
"\\mathfrak" : function(tokens ) { return v_fontToMathml (tokens , "fraktur" ) ; } ,
"\\mathit" : function(tokens ) { return v_fontToMathml (tokens , "italic" ) ; } ,
"\\mathscr" : function(tokens ) { return v_fontToMathml (tokens , "script" ) ; } ,
"\\mathcal" : function(tokens ) { return v_fontToMathml (tokens , "script" ) ; } ,
"\\mathsf" : function(tokens ) { return v_fontToMathml (tokens , "sans-serif" ) ; } ,
"\\mathtt" : function(tokens ) { return v_fontToMathml (tokens , "monospace" ) ; } ,
"\\EuScript" : function(tokens ) { return v_fontToMathml (tokens , "script" ) ; } ,
"\\bf" : function(tokens ) { return v_old_fontToMathml (tokens , "bold" ) ; } ,
"\\rm" : function(tokens ) { return v_old_fontToMathml (tokens , "normal" ) ; } ,
"\\big" : function(tokens ) { return v_sizeToMathml (tokens , "2" , "2" ) ; } ,
"\\Big" : function(tokens ) { return v_sizeToMathml (tokens , "3" , "3" ) ; } ,
"\\bigg" : function(tokens ) { return v_sizeToMathml (tokens , "4" , "4" ) ; } ,
"\\Bigg" : function(tokens ) { return v_sizeToMathml (tokens , "5" , "5" ) ; } ,
"\\acute" : function(tokens ) { return v_accentToMathml (tokens , "\u0301" ) ; } ,
"\\grave" : function(tokens ) { return v_accentToMathml (tokens , "\u0300" ) ; } ,
"\\tilde" : function(tokens ) { return v_accentToMathml (tokens , "\u0303" ) ; } ,
"\\bar" : function(tokens ) { return v_accentToMathml (tokens , "\u0304" ) ; } ,
"\\breve" : function(tokens ) { return v_accentToMathml (tokens , "\u0306" ) ; } ,
"\\check" : function(tokens ) { return v_accentToMathml (tokens , "\u030c" ) ; } ,
"\\hat" : function(tokens ) { return v_accentToMathml (tokens , "\u0302" ) ; } ,
"\\vec" : function(tokens ) { return v_accentToMathml (tokens , "\u20d7" ) ; } ,
"\\dot" : function(tokens ) { return v_accentToMathml (tokens , "\u0307" ) ; } ,
"\\ddot" : function(tokens ) { return v_accentToMathml (tokens , "\u0308" ) ; } ,
"\\dddot" : function(tokens ) { return v_accentToMathml (tokens , "\u20db" ) ; } ,
"\\underbrace" : function(tokens ) { return v_underToMathml (tokens , "\ufe38" ) ; } ,
"\\overbrace" : function(tokens ) { return v_overToMathml (tokens , "\ufe37" ) ; } ,
"\\underline" : function(tokens ) { return v_underToMathml (tokens , "\u0332" ) ; } ,
"\\overline" : function(tokens ) { return v_overToMathml (tokens , "\u00af" ) ; } ,
"\\widetilde" : function(tokens ) { return v_overToMathml (tokens , "\u0303" ) ; } ,
"\\widehat" : function(tokens ) { return v_overToMathml (tokens , "\u0302" ) ; } ,
"\\not" : function(tokens ) { return v_combiningToMathml (tokens , "\u0338" ) ; } ,
"\\left" : function(tokens, topRow ) { return v_delimiterToMathml (tokens , "\\right", topRow);}, //, "1" , null ) ; } ,
"\\bigl" : function(tokens, topRow ) { return v_delimiterToMathml (tokens , "\\bigr", topRow);}, //, "2" , "2" ) ; } ,
"\\Bigl" : function(tokens, topRow ) { return v_delimiterToMathml (tokens , "\\Bigr", topRow);}, //, "3" , "3" ) ; } ,
"\\biggl" : function(tokens, topRow ) { return v_delimiterToMathml (tokens , "\\biggr", topRow);}, //, "4" , "4" ) ; } ,
"\\Biggl" : function(tokens, topRow ) { return v_delimiterToMathml (tokens , "\\Biggr", topRow);}, //, "5" , "5" ) ; } ,
"\\char" : v_char_escapeToMathml ,
"\\!" : function(tokens ) { return null ; } ,
"\\text" : v_textToMathml ,
"\\textnormal" : v_textToMathml ,
"\\textrm" : v_textToMathml ,
"\\textsl" : v_textToMathml ,
"\\textit" : v_textToMathml ,
"\\texttt" : v_textToMathml ,
"\\textbf" : v_textToMathml ,
"\\hbox" : v_textToMathml ,
"\\mbox" : v_textToMathml ,
"\\begin" : v_latex_blockToMathml
};

// ================================================================
var g_tex_environments
= { "smallmatrix" : function(tokens ) { return v_matrixToMathml (tokens , "(" , ")" ) ; } ,
    "pmatrix" : function(tokens ) { return v_matrixToMathml (tokens , "(" , ")" ) ; } ,
    "bmatrix" : function(tokens ) { return v_matrixToMathml (tokens , "[" , "]" ) ; } ,
    "Bmatrix" : function(tokens ) { return v_matrixToMathml (tokens , "{" , "}" ) ; } ,
    "vmatrix" : function(tokens ) { return v_matrixToMathml (tokens , "|" , "|" ) ; } ,
    "Vmatrix" : function(tokens ) { return v_matrixToMathml (tokens , "\u2016" , "\u2016" ) ; } ,
    "cases" : function(tokens ) { return v_matrixToMathml (tokens , "{" , null ) ; } ,
    "array" : v_arrayToMathml ,
    "displaymath" : v_displaymathToMathml
};

// ================================================================
var g_limitCommands = { "\\bigcap" : "\u22c2" ,
    "\\bigcup" : "\u22c3" ,
    "\\bigodot" : "\u2a00" ,
    "\\bigoplus" : "\u2a01" ,
    "\\bigotimes" : "\u2a02" ,
    "\\bigsqcup" : "\u2a06" ,
    "\\biguplus" : "\u2a04" ,
    "\\bigvee" : "\u22c1" ,
    "\\bigwedge" : "\u22c0" ,
    "\\coprod" : "\u2210" ,
    "\\prod" : "\u220f" ,
    "\\sum" : "\u2211" ,
    "\\inf" : "inf" ,
    "\\injlim" : "inj lim" ,
    "\\lim" : "lim" ,
    "\\liminf" : "lim inf" ,
    "\\limsup" : "lum sup" ,
    "\\max" : "max" ,
    "\\min" : "min" ,
    "\\projlim" : "proj lim" ,
    "\\sup" : "sup" ,
    "\\underbrace" : null ,
    "\\overbrace" : null ,
    "\\underline" : null ,
    "\\overline" : null
};

/***********************************************************************
  Modified by: Nick Feng    12/20/2011
***********************************************************************/
function v_pieceToMathml (tokens)
{
    var v_token = tokens.list[tokens.index];
    var v_result = null;

    if( v_token == "{" ) // process a subgroup nodes:
    {
        tokens.index++;
        v_result = v_subExprChainToMathml(tokens, g_hard_stopTokens) ;

        if( tokens.list[tokens.index] == "}" )
            tokens.index++;
    }
    else // if token is a symbol, add it to the result:
        if( (v_result = addSymbol(tokens, g_relationSymbols )) == null)
            if( (v_result = addSymbol(tokens, g_operatorSymbols)) == null)
                if( (v_result = addSymbol(tokens, g_leftDelimiters )) == null)
                    if( (v_result = addSymbol(tokens, g_rightDelimiters )) == null)
                    {
                        // It's not a symbol:
                        if( v_token in g_wordOperators ) // It's a function such as log
        {
            // add function header:
            v_result = resultElement("mi", g_wordOperators[v_token]) ;
            tokens.index++; // point to function content
            
//          v_result = processFunction(tokens);
/*
            var endTeststr = tokens.index+1;
            if (tokens.list.length > endTeststr) // not end of the token:
                v_result = resultElement("mrow", v_result); //just add the function name without bracket
*/                
        }
        else if( v_token in g_greekLetters ) // it's a greek letter:
        {
            v_result = resultElement("mi", g_greekLetters[ v_token ] ) ;
            tokens.index++;
        }
        else if( v_token in g_namedIdentifiers )
        {
            v_result = resultElement("mi", g_namedIdentifiers[ v_token ] ) ;
            tokens.index++;
        }
        // insert a 'mtext' tag node with the symbol content:
        else if( v_token in g_punctAndSapce )
        {
            v_result = resultElement("mtext", g_punctAndSapce[ v_token ] ) ;
            tokens.index++;
        }
        else if( v_token in g_textCommands )
        {
            tokens.index++;
            v_result = g_textCommands[v_token]( tokens );
        }
        else // It's a number:
        {
            v_result = resultElement("mn", v_token ) ;
            tokens.index++;
        }
    }

    return v_result ;
}
/*
//==========================================
// return symbolNode, null means no token match
// - for function only takes one parameter !!!
//==========================================
function processFunction(tokens)
{
    var symbolNode = null;
    var token = tokens.list[tokens.index];
    
    // should start with a mrow tag???
    
    // function header:
    symbolNode = resultElement("mi", tokenGrp[token] ) ;
    
    var content = tokens.list[++tokens.index];
    
    // get next token as the content of the function
    if( content == '+' || content == '-' )
    {
        symbolNode = resultElement("mo", tokenGrp[ token ] ) ;
        tokens.index++;
    }
    return symbolNode;
}
*/
//==========================================
// return symbolNode, null means no token match
//==========================================
function addSymbol(tokens, tokenGrp)
{
    var symbolNode = null;
    var token = tokens.list[tokens.index];
    if( token in tokenGrp )
    {
        symbolNode = resultElement("mo", tokenGrp[ token ] ) ;
        tokens.index++;
    }
    return symbolNode;
}

/********************************************************************************
 Check superscript and subscript condition
 Nick Feng  12/14/2011
********************************************************************************/
function isSuperSubScript(tokens)
{
    return (
         ( tokens.list[tokens.list.length <=tokens.index + 0 ? tokens.list.length-1 : tokens.index+ 0 ] == "{" )
      && ( tokens.list[tokens.list.length <=tokens.index + 1 ? tokens.list.length-1 : tokens.index+ 1 ]== "}" )
      && ( ( tokens.list[tokens.list.length<=tokens.index+ 2 ? tokens.list.length-1 : tokens.index+ 2 ]== "_" )
           ||
           ( tokens.list[tokens.list.length<=tokens.index+ 2 ? tokens.list.length-1 : tokens.index+ 2 ]== "^" )
         )
      );
}

// ================================================================
// ================================================================
function isNumberStr(str)
{
    return (str >= '0' && str <= '9');
}

/**********************************************************************
 This function handles the case that the parser doesn't interpret the
 single digit log base or exponent number correctly.
 At the entry point the single digit base and the number behind it already
 wrongly processed as one piece of content.
 The new content consists of the separated single digit and a pair of
 brackets around it, along with the corrected number behind.
 The new content is inserted back to the token list and the token index
 is set back so that the new content will be processed to generate
 correct result.
**********************************************************************/
function singleDigitScriptLogPow(tokens, v_subscript)
{
    if (tokens.index-1 >= 0
        && tokens.list[tokens.index-1] != '}' // multi-digit base is already handled correctly witha {} grouping
        && v_subscript.content.length === 1
        && isNumberStr(v_subscript.content[0])) // token separate letters correctly
    {
        var singleBase = v_subscript.content[0];
        var correctContent = singleBase.slice(1);  // only wants the rest of the content
        singleBase = singleBase.slice(0,1); // extract the 1st digit as log base

//        v_subscript = resultElement('mrow', ',', correctContent, ')' );

        var startIndex = tokens.index-1;
        var index = startIndex;
//        tokens.list.splice(index, 0, '('); // open paren for strKI
//        index++;
        tokens.list.splice(index, 0, '{'); // insert the single digit base
        index++;
        tokens.list[index] = singleBase; // insert the single digit base
        index++; // pass the singleBase digit
        tokens.list.splice(index, 0, '}'); // insert the single digit base
        if (correctContent && correctContent != "") {
            index++;
            tokens.list.splice(index, 0, correctContent); // insert the content digits
        }

        tokens.index = startIndex; // set index to left delimitor of the single digit base
        v_subscript = v_pieceToMathml(tokens ); // reprocess the content
    }

    return v_subscript;
}

/**********************************************************************
 Input:
    tokens - tokens list with index pointing to the subscript token to
             be processed.

 return:
    if (logrithm) -
        processed log combination.
    else -
        the v_subscript.
**********************************************************************/
function processSubsript(tokens)
{
    var v_comma = resultElement("mtext", ',' ) ;
    var v_endBracket = resultElement("mo", ')' ) ;
    var v_2ndPart, v_subscript;

    tokens.index++;

    if (tokens.list[tokens.index-2] == '\\log')
    {
        v_subscript = v_pieceToMathml(tokens );
        v_subscript = singleDigitScriptLogPow(tokens, v_subscript);

        v_2ndPart = v_subExprToMathml(tokens); //v_pieceToMathml(tokens ); //
        v_subscript = resultElement("mlog", v_subscript, v_comma, v_2ndPart);
    }
    else
        if( tokens.list[tokens.index-1] == "_" )
    {
        v_subscript = v_pieceToMathml(tokens );
        v_subscript = resultElement("mrow", v_subscript, v_endBracket ) ;
    }

    return v_subscript;
}

/**********************************************************************
 Input:
    tokens - tokens list with index pointing to the superscript token to
             be processed.
 return:
    if (logrithm) -
        processed pow combination.
    else -
        the v_superscript.
**********************************************************************/
function processPow(tokens)
{
    var v_superscript;

    tokens.index++;

    if (tokens.list[tokens.index-1] == '^')
    {
        v_superscript = v_pieceToMathml(tokens);
        v_superscript = singleDigitScriptLogPow(tokens, v_superscript);
    }
    else
        v_superscript = v_pieceToMathml(tokens);

    return v_superscript;
}

//==================================================
// return: if null means symbol not processed
//==================================================
function canSymbolProcess (tokens, symbol)
{
    if( tokens.list[tokens.index] == symbol) {
        tokens.index++;
        return v_pieceToMathml(tokens);
    }
    return null;
}

//=================================================================
//=================================================================
function checkSuperSubScipt(tokens, v_mmultiscripts, v_mprescripts)
{
    tokens.index += 2;

    var v_subscript = null ;
    var v_superscript = null ;

    if((v_subscript = canSymbolProcess(tokens, "_" )) == null)
        v_superscript = canSymbolProcess(tokens, "^");
    
    var subscript = null;
    var superscript = null;
    
    // v_subscript and v_superscript may not be null anymore after above process:
    if((subscript = canSymbolProcess(tokens, "_" )) != null)
        v_subscript = subscript;
    else
        if ((superscript = canSymbolProcess(tokens, "^" )) != null)
            v_superscript = superscript;

    appendPrependMultiScripts(v_subscript, v_superscript, v_mmultiscripts, v_mprescripts);
}

//==============================================================================================
// inputs:  v_subscript, v_superscript
// outputs: v_mmultiscripts, v_mprescripts
//==============================================================================================
function appendPrependMultiScripts(v_subscript, v_superscript, v_mmultiscripts, v_mprescripts)
{
    if (v_mprescripts == null) { // Append sub/superscript node to parent node v_mmultiscripts:
        resultElement_append(v_mmultiscripts,
                             ((v_subscript != null)? v_subscript: resultElement("none")));
        resultElement_append(v_mmultiscripts,
                             ((v_superscript!= null)? v_superscript: resultElement("none")));
    }
    else {
        resultElement_prepend( v_mmultiscripts ,
                             ( v_superscript != null ) ? v_superscript : resultElement("none"),
                               v_mprescripts);
        resultElement_prepend( v_mmultiscripts ,
                             ( v_superscript != null ) ? v_superscript : resultElement("none"),
                               v_mprescripts);
    }
}

//===========================================================================
// TBD:
// with the following method, log and power processing do not need to
// check multiple times anymore, the key is using pieceMathML, which
// in turn will call exprSubChain again. So it will be scalable!
/*
function v_subExprToMathml(tokens)
{
    if (isSubSuper(v_token))
    {
          v_func = resultMathml("mi", v_token); // function header
          v_base = pieceMathml(token); // it will call exprSubChain(token)
          v_value= pieceMathml(token);
          v_result = resultIntoNode(wrowTop, v_func, v_base, v_comma, v_value);
    }
......
}
*/
//===========================================================================
function v_subExprToMathml(tokens)
{
    var v_result = null ;
    var v_mmultiscripts = null ;
    var v_mprescripts = null ;

    //------------------ subscript / superscript processing: ----------------------
    if (isSuperSubScript(tokens))
    {
        // generate parent node with no content:
        v_mmultiscripts = resultElement("mmultiscripts") ;
        v_mprescripts = resultElement("mprescripts") ;
        resultElement_append( v_mmultiscripts, v_mprescripts );

        while (isSuperSubScript(tokens)) // attach all sub/super nodes to parent node v_mmultiscripts:
            checkSuperSubScipt(tokens, v_mmultiscripts);
    }
    //------------------ end subscript / superscript processing: ----------------------

    var v_limit_style = (tokens.list[tokens.index] in g_limitCommands);
    var v_token = tokens.list[tokens.index];

    if( v_token == null ) // end of token list:
    {
        if( v_mmultiscripts != null ) // found subscript / superscript nodes, insert tag before prescripts:
        {
           resultElement_prepend( v_mmultiscripts , resultElement("mrow") , v_mprescripts );
           return v_mmultiscripts ;
        }
        else
            return resultElement("mrow") ; 
    }
    else
        if( v_token in g_leftDelimiters)  // before next group of operations:
            v_result = v_heuristic_subexpression(tokens);
        else // whatever is left:
            v_result = v_pieceToMathml (tokens);

    //------------------ subscript / superscript processing: ----------------------
    var v_base = v_result ;
    v_token = tokens.list[tokens.index]; // use the updated index
    
    // Check if any subscript or superscript after the previous sub/superscript base:
    var v_subscript = null ;
    var v_superscript = null ;
    var v_beginBracket = resultElement("mo",'(' );
    var v_endbracket = resultElement("mo",')' );

    if( v_token == "_")
        v_subscript = processSubsript(tokens);
    else if( v_token == "^")
        v_superscript = processPow(tokens);

    v_token = tokens.list[tokens.index]; // use the updated index
    if( v_token == "_" ) {
        tokens.index++;
        v_subscript = v_pieceToMathml(tokens);
    }
    else if( v_token == "^")
        v_superscript = processPow(tokens);

    // if any sub/superscript base before this, which determins if need to add tags before the base:
    if( v_mmultiscripts)
    {
        resultElement_prepend( v_mmultiscripts, v_base , v_mprescripts );
        appendPrependMultiScripts(v_subscript, v_superscript, v_mmultiscripts, v_mprescripts);
    }
    //------------------ end subscript / superscript processing: ----------------------

    //------------------ subscript / superscript processing: ----------------------
    while (isSuperSubScript(tokens)) {
        if( v_mmultiscripts) {
            v_mmultiscripts = resultElement("mmultiscripts", v_base);
            v_mprescripts = null ;

            if((v_superscript != null)||(v_subscript != null))
                appendPrependMultiScripts(v_subscript, v_superscript, v_mmultiscripts);
        }

        checkSuperSubScipt(tokens, v_mmultiscripts);
    }
    //------------------ end subscript / superscript processing: ----------------------

     if(v_mmultiscripts)
        v_result = v_mmultiscripts ;
     else
        v_result =
            mergeSubSuperScriptResults(v_subscript, v_superscript,
                                       v_limit_style, v_base, v_result);
    return v_result ;
}

//===========================================================================
//===========================================================================
function mergeSubSuperScriptResults(sub, _super, limitStyle, base, result)
{
    if(sub &&_super)
        result = resultElement(( limitStyle? "munderover" : "msubsup" ),
                                 base, sub, _super);
    else if(sub)
        result = resultElement((limitStyle? "munder" : "msub"),
                                base, sub ) ;
    else if(_super)
        result = resultElement((limitStyle? "mover" : "msup" ),
                                base , _super );
    return result;
}

//===========================================================================
//  Process tokens and generate MathMl tags with precedence relationships
//===========================================================================
function v_subExprChainToMathml (tokens, v_stopTokens, topRow)
{
    var v_result = topRow;
    if (!v_result)
        v_result = resultElement("mrow");
        
    //var v_wrapped_result = null ;

    while( tokens.list[tokens.index] != null  // not the end of the token list:
         &&  !( tokens.list[tokens.index] in v_stopTokens ))
    {   
        // precedence: multiplication, addition, relations:
        v_collectInvisibleGrp( v_result, tokens, v_stopTokens );
        /*
            collectPrecedenceGrp (tokens, g_relationPrecedenceGrp, v_stopTokens,
                function(tokens , v_stopTokens )
                {
                    return collectPrecedenceGrp (tokens, g_additionPrecedenceGrp, v_stopTokens,
                            function(tokens , v_stopTokens )
                            {
                                return collectPrecedenceGrp (tokens, multiplicationPrecedenceGrp,
                                          v_stopTokens, v_collectInvisibleGrp ) ;
                            }
                        );
                }
            );
        */
        //resultIntoNode(v_result, v_node);
/*        
        if( v_result != null ) // append to result nodes with a new row:
        {
            //v_mrow = resultElement("mrow", v_result, v_node );
            //v_result = v_mrow ;
			resultIntoNode(v_result, v_node);
        }
        else // start from the top, need to have a <mrow> as parent for all children get under:
        {
            //v_result = resultElement("mrow", v_node );
			resultIntoNode(v_result, v_node);
            //v_result = v_node; // Starting list of result nodes
        }
*/        
    } // end while node.list

    return v_result ;
}

// ================================================================
var g_optional_arg_stopTokens = { "&" : null ,
    "\\\\" : null ,
    "}" : null ,
    "$" : null ,
    "\\end" : null ,
    "\\right" : null ,
    "\\bigr" : null ,
    "\\Bigr" : null ,
    "\\biggr" : null ,
    "\\Biggr" : null ,
    "\\choose" : null ,
    "\\over" : null ,
    "]" : null
};

// ================================================================
// ================================================================
function v_optional_argToMathml (tokens )
{
    if( tokens.list[tokens.index] != "[" ) {
        return null ;
    }
    tokens.index++;

    var v_result = v_subExprChainToMathml (tokens , g_optional_arg_stopTokens) ;

    if( tokens.list[tokens.index] == "]" ) {
        tokens.index++;
    }
    return v_result ;
}

// ================================================================
var g_hard_stopTokens = { "&" : null ,
    "\\\\" : null ,
    "}" : null ,
    "$" : null ,
    "\\end" : null ,
    "\\right" : null ,
    "\\bigr" : null ,
    "\\Bigr" : null ,
    "\\biggr" : null ,
    "\\Biggr" : null ,
    "\\choose" : null ,
    "\\over" : null
};

// ================================================================
var g_right_delimiter_stopTokens = { "&" : null ,
    "\\\\" : null ,
    "}" : null ,
    "$" : null ,
    "\\end" : null ,
    "\\right" : null ,
    "\\bigr" : null ,
    "\\Bigr" : null ,
    "\\biggr" : null ,
    "\\Biggr" : null ,
    "\\choose" : null ,
    "\\over" : null ,
    ")" : ")" ,
    "]" : "]" ,
    "\\}" : "}" ,
    "\\rbrace" : "}" ,
    "\\rgroup" : ")" ,
    "\\rvert" : "|" ,
    "\\rVert" : "\u2016" ,
    "\\rceil" : "\u2309" ,
    "\\rfloor" : "\u230b" ,
    "\\rmoustache" : "\u23b1" ,
    "\\rangle" : "\u232a"
};

// ================================================================
// ================================================================
function v_heuristic_subexpression (tokens )
{
    var v_result = resultElement("mrow") ;
    resultElement_append( v_result, v_pieceToMathml (tokens) );
    v_subExprChainToMathml (tokens, g_right_delimiter_stopTokens, v_result);
    if(( tokens.list[tokens.index] != null )
       &&
       !(tokens.list[tokens.index] in g_hard_stopTokens)
       )
    {
        resultIntoNode( v_result, v_pieceToMathml(tokens) );
    }
    return v_result ;
}

// ================================================================
var g_relationPrecedenceGrp = g_relationSymbols;
var g_additionPrecedenceGrp = { "+" : null, "-" : null, "\\oplus" : null};
var multiplicationPrecedenceGrp = { "*" : null, "\\times" : null, "\\cdot" : null, "/" : null};

/**********************************************************************************************
  process tokens with precedence rules
**********************************************************************************************/
function collectPrecedenceGrp (tokens, v_operators, v_stopTokens, v_reader )
{
    var v_result = v_reader (tokens, v_stopTokens); // precess higher precedence token first
/*
    var v_mrow = null;
    var v_token = tokens.list[tokens.index];

    while( v_token &&  // not the end of token list
         !( v_token in v_stopTokens) &&(v_token in v_operators) ) // current token is in the operator list:
    {
        // Starting the beginging of a row node with the higher precedence nodes as content:
        if( v_mrow == null )
        {
            v_mrow = resultElement("mrow", v_result ) ;
            v_result = v_mrow ;
        }

        // Apend the new operator:
//        resultElement_append(v_mrow, v_pieceToMathml(tokens) );
        
//        v_token = tokens.list[tokens.index]; // get updated token

//        if(v_token && (v_token in v_stopTokens))
            return v_result ; // finished with hard stop

        else // Check and append new higher precedence nodes:
            resultElement_append(v_mrow, v_reader(tokens, v_stopTokens ) );

        v_token = tokens.list[tokens.index]; // get updated token
    }
*/	
    return v_result ;
}

// ================================================================
// ================================================================
function v_collectInvisibleGrp (v_mrowTop, tokens, v_stopTokens )
{
//    var v_result = v_subExprToMathml (tokens);
    resultIntoNode(v_mrowTop, v_subExprToMathml(tokens));
//    var v_mrow = null ;
    var v_token = tokens.list[tokens.index]; // update token

    // Process variables, function headers and leftDelimiters:
    while( v_token && // not finished
          !(v_token in v_stopTokens) && // not a closing braket
           (v_token in g_namedIdentifiers || ( v_token in g_leftDelimiters))) // open brakets
    {   /*
        if( v_mrow == null ) {
            v_mrow = resultElement("mrow", v_result ) ;
            v_result = v_mrow ;
        }
        */
		resultIntoNode(v_mrowTop, v_subExprToMathml(tokens));
/*
        if(v_token && (v_token in v_stopTokens))
            return v_mrowTop; //v_result;
        else
//            resultElement_append( v_mrow, v_subExprToMathml(tokens) );
			resultIntoNode(v_mrowTop, v_subExprToMathml(tokens));
*/        
        v_token = tokens.list[tokens.index]; // update token
    }
    return v_mrowTop; //v_result;
}

// ================================================================
//const
var tokenize_re = /(\\begin|\\operatorname|\\mathrm|\\mathop|\\end)\s*\{\s*([A-Z a-z]+)\s*\}|(\\[a-zA-Z]+|\\[\\#\{\},:;!])|(\s+)|([0-9\.]+)|([\$!"#%&'()*+,-.\/:;<=>?\[\]^_`\{\|\}~])|([a-zA-Z])/g;

//const
var tokenize_text_re = /[\${}\\]|\\[a-zA-Z]+|[^{}\$]+/g;

// ================================================================
//const
var tokenize_text_commands = {
  '\\textrm': 1,
  '\\textsl': 1,
  '\\textit': 1,
  '\\texttt': 1,
  '\\textbf': 1,
  '\\textnormal': 1,
  '\\text': 1,
  '\\hbox': 1,
  '\\mbox': 1
};

//=================================================
// parameter:   input - string in latex format
// return:      result - array of tokens
//=================================================
function tokenize_latex_math(input)
{
  var result = [];
  var in_text_mode = 0;
  var brace_level = [];
  var pos = 0;

/*
  if(input.charAt(0) == '$' &&
     input.charAt(input.length-1) == '$')
        input = input.slice(1, input.length-1);
*/
  /*==========================================================================================================
  tokenize_re is a regular expression object containing pattern and applicable flags.

  Element zero of the array contains the entire match, while elements 1 – n contain any submatches
  that have occurred within the match.

  If the global flag is set for a regular expression, exec searches the string beginning at the position
  indicated by the value of lastIndex. If the global flag is not set, exec ignores the value of lastIndex
  and searches from the beginning of the string.

  The array returned by the exec method has three properties, input, index and lastIndex. The input property
  contains the entire searched string. The index property contains the position of the matched substring
  within the complete searched string.

  The lastIndex property contains the position following the last character in the match.
  ==========================================================================================================*/
  while(1) {
    if(!in_text_mode) {
        tokenize_re.lastIndex = pos;     // start token search from current position
        var m = tokenize_re.exec(input); // store matched token into m
        pos = tokenize_re.lastIndex;     // update current position of for the next search

        if(m == null)
          return result; // the only exit for the non-in_text_mode loop

        else if( m[1] != null) {
            result.push(m[1], m[2]);
        } else if(m[3] == '\\sp') {
            result.push('^');
        } else if(m[3] == '\\sb') {
            result.push('_');
        } else
        {
//            if(m[0] == '$') {
//                in_text_mode = 1;
//            } else
            if(m[4] != null) {
              continue;
            } else if(m[3] != null && m[3] in tokenize_text_commands) {
              in_text_mode = 2;
              brace_level.push(0);
            }

            result.push(m[0]); // store the current token
        }
    }
    else // in_text_mode:
    {
        tokenize_text_re.lastIndex = pos;
        var m = tokenize_text_re.exec(input);
        pos = tokenize_text_re.lastIndex;

        if(m == null) {
            return result;
        } else if(m[0] == '$') {
            in_text_mode = 0;
        } else if(m[0] == '{') {
            brace_level[brace_level.length-1]++;
        } else if(m[0] == '}') {
            if(--brace_level[brace_level.length-1] <= 0) {
                in_text_mode = 0;
                brace_level.pop();
            }
        }
        result.push(m[0]);
    }
  }
}

// ================================================================
// ================================================================
function xml_escape(s)
{
  s = s.replace('&', '&amp;').
        replace('<', '&lt;').
        replace('>', '&gt;');

  return s.replace(/[\u0080-\uffff]/, function(x) { return '&#' + x.charCodeAt(0) + ';' });
}

// ================================================================
// ================================================================
function xml_attr_escape(s)
{
  s = s.replace('&', '&amp;').
        replace('"', '&quot;').
        replace('<', '&lt;').
        replace('>', '&gt;');

  return s.replace(/[\u0080-\uffff]/,
                   function(x) {
                    return '&#' + x.charCodeAt(0) + ';' }
                );
}

/*****************************************************************************
  Convert processed node tree to string,
  which include inserting string of tags according to the tags of a node.
******************************************************************************/
// working vars:
var   strMl = "";
//=======================================================
function resetPrint()
{
    strMl = "";
}

//=======================================================
//=======================================================
function serialize_mathml(tree)
{
    if(tree instanceof PlainXMLNode)
    {
        var start_tag = '<' +tree.tag+ '>';
        var end_tag = '</' +tree.tag+ '>';

        //----------------------------------------------------------------------
        if(tree.content.length == 1 &&  // only one content node:
            typeof(tree.content[0]) == 'string')
        {
            var content = xml_escape(tree.content[0]);
            strMl += (start_tag + content + end_tag);
        }
        else // more than one content node or content is not a string:
        {
            var tagAllowed = false;
//            if ((start_tag.indexOf("mrow") == -1) // flatten the mrows
//                || (start_tag.indexOf("mfrac") != -1 ))
                    //(tree.content.length == 2) && (tree.content[0].tag == 'mn' && tree.content[1].tag == 'mi')))
            {
//                tagAllowed = true;
                strMl += (start_tag);
            }

            for(var i=0; i < tree.content.length; i++)
                serialize_mathml(tree.content[i]); // one level deeper

//            if (tagAllowed) // flatten the mrows
                strMl += (end_tag);
        }
    }
}

//===========================================
//===========================================
function dbgString(nodeTree)
{
  resetPrint();
  serialize_mathml(nodeTree);
  return strMl;
}
//exports.laTeXToMathML = laTeXToMathML;

})();
