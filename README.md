ASP.NET Unobtrusive AJAX support library for Prototype / pure JS
================================================================

This library adds support for the [Prototype JavaScript framework](http://prototypejs.org/) to the
ASP.NET MVC AJAX helpers. A version that uses "pure" JavaScript (no framework) is currently under
construction.

To use the native JS version (not recommended right now), add native.unobtrusive-ajax.js to your
JavaScript combiner/minifier

To use Prototype version:

 - Ensure you are using Prototype 1.7 or above
 - Add prototype.unobtrusive-ajax.js to your JavaScript combiner/minifier
 - Use the regular [AJAX helper methods](http://msdn.microsoft.com/en-us/library/dd493139.aspx)
 

 
TODO for "pure" / native JS version
===================================
 - Store details of button that was pressed to submit form
 - Support for old IE (IE 8 and below)
 - Support for image buttons (is this really needed?)

Licence
=======
(The MIT licence)

Copyright (C) 2013 Daniel Lo Nigro (Daniel15)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
