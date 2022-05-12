import { Component, EventEmitter, OnInit, Output } from "@angular/core";

@Component({
  selector: "counter-input",
  templateUrl: "./counter-input.component.html",
  styleUrls: ["./counter-input.component.scss"],
})
export class CounterInputComponent implements OnInit {
  @Output() countChange = new EventEmitter<any>();
  count: number = 0;
  constructor() {}

  ngOnInit() {}

  updateCounter(v: number) {
    this.count += v;
    this.emitCountValue();
  }
  inputChanged(e) {
    console.log(e.target.value, this.count);
    this.emitCountValue();
  }
  emitCountValue() {
    this.countChange.emit(this.count);
  }
}
