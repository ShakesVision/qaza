import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { AbstractControl, FormControl } from "@angular/forms";

@Component({
  selector: "counter-input",
  templateUrl: "./counter-input.component.html",
  styleUrls: ["./counter-input.component.scss"],
})
export class CounterInputComponent implements OnInit {
  @Output() countChange = new EventEmitter<any>();
  @Input() control: AbstractControl = new FormControl();
  @ViewChild("countInput", { static: true }) countInput: ElementRef;
  count: number = 0;
  constructor() {}

  ngOnInit() {}

  updateCounter(v: number) {
    let value = parseInt(this.countInput.nativeElement.value);
    value += v;
    this.control.markAsDirty();
    this.emitCountValue(value);
  }
  inputChanged(e) {
    this.emitCountValue(e.target.value);
  }
  emitCountValue(v: number) {
    console.log("emitting " + v);
    this.countChange.emit(v);
  }
}
