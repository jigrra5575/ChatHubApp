import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlightText',
  standalone: false,
})
export class HighlightTextPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: any, args: any): SafeHtml {
    if (!args) { return value; }
    
    // સર્ચ કરેલા શબ્દને પકડવા માટે Regex
    const re = new RegExp(args, 'gi');
    const match = value.match(re);

    if (!match) { return value; }

    // શબ્દની આજુબાજુ <mark> ટેગ લગાડો
    const replacedValue = value.replace(re, `<mark style="background-color: #ffc107; color: black; padding: 0 2px; border-radius: 2px;">${match[0]}</mark>`);
    
    return this.sanitizer.bypassSecurityTrustHtml(replacedValue);
  }

}
