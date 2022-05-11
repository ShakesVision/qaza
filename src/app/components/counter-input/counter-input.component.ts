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
    this.countChange.emit(this.count);
  }
}
