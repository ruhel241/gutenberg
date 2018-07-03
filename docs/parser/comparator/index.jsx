import React, { Component, Fragment } from "react";
import ReactDOM from "react-dom";
import { isEqual, random, range, sample } from 'lodash';

import Button from "components/button";
import Card from "components/card";
import TextInput from "components/forms/form-text-input";

const l = m => (console.log(m), m);

class ParserPicker extends Component {
  state = {
    parsers: {
      Left: "http://localhost:8001",
      Right: "http://localhost:8002"
    }
  };

  updateUrl = ({ target: { dataset: { name }, value } }) =>
    this.setState(({ parsers }) => ({
      parsers: { ...parsers, [name]: value }
    }));

  next = () => this.props.next(this.state);

  render() {
    const { parsers } = this.state;
    return (
      <Card>
        {Object.keys(parsers)
          .map(name => [name, parsers[name]])
          .map(([name, url]) => (
            <p key={name}>
              <label htmlFor={`parser-${name}`}>{name}: </label>
              <TextInput
                name={`parser-${name}`}
                type="url"
                data-name={name}
                value={url}
                onChange={this.updateUrl}
                disabled={!this.props.next}
              />
            </p>
          ))}
        {this.props.next && <Button onClick={this.next}>Compare outputs</Button>}
      </Card>
    );
  }
}

class LibraryLoader extends Component {
  state = {
    documents: {}
  }

  componentDidMount() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://raw.githubusercontent.com/dmsnell/gutenberg-document-library/master/post-list.txt');
    xhr.onload = () => this.setState({
      documents: xhr.responseText.trim().split('\n').reduce((o, url) => ({ ...o, [url]: null }), {})
    }, this.loadDocs)
    xhr.onerror = () => l('Failed to load documents');
    xhr.send();
  }

  loadDocs = () => {
    const { documents } = this.state;
    const urls = Object.keys(documents);

    urls.forEach(url => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onload = () => this.setState(({ documents }) => ({
        documents: {
          ...documents,
          [url]: xhr.responseText
        }
      }), this.proceed);
      xhr.onerror = () => l('Failed to load ' + url);
      xhr.send();
    });
  };

  proceed = () => {
    const { documents } = this.state;

    if (Object.keys(documents).every(url => documents[url] !== null)) {
      this.props.next(this.state);
    }
  }

  render() {
    const { documents } = this.state;
    const urls = Object.keys(documents);
    const docs = urls.map(url => documents[url]);
    const hasUrls = urls.length !== 0;
    const hasAllDocs = docs.every(a => a !== null);

    return (
      <Card>
        {hasUrls ?
          <p>⏳ Loading list of documents from repository…</p> :
          <p>✅ Loaded list of documents from repository…</p>
        }
        {hasUrls && (
          <Fragment>
            <p>⏳Loading individual test documents…</p>
            <ul>
              {urls.map(url => (
                <li key={url}>{documents[url] === null ?
                  <p>⏳ Loading <a href={url}>{url}</a></p> :
                  <p>✅ Loaded <a href={url}>{url}</a></p>}</li>
              ))}
            </ul>
          </Fragment>
        )}
      </Card>
    );
  }
}

class OutputComparator extends Component {
  state = {
    allEqual: null,
    done: false,
    failed: false,
  }

  componentDidMount() {
    const { documents, parsers } = this.props;

    Promise.all(Object.keys(parsers).map(name => new Promise((resolve, reject) => {
      const url = parsers[name];

      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.onload = () => resolve(JSON.parse(xhr.responseText));
      xhr.onerror = () => reject();
      xhr.send(documents[Object.keys(documents)[0]]);
    })))
      .then(outputs => this.setState({
        done: true,
        allEqual: outputs.reduce(([stillEqual, prev], { parse: next }) => prev === null || stillEqual === false
          ? [stillEqual, next]
          : [isEqual(prev, next), next], [true, null])[0]
      }, this.props.next), () => this.setState({ done: true, failed: true }))

    window.isEqual = isEqual;
  }

  render() {
    const { allEqual, done, failed } = this.state;

    return (
      <Card>
        {!done ? (
          <p>Comparing outputs…</p>
        ) : (
            failed ? <p>Failed to test all parsers!</p> : <p>Output equal? {allEqual ? 'true' : 'false'}</p>
          )}
      </Card>
    );
  }
}

class Histogram extends Component {
  render() {
    const { data } = this.props;
    const maxHeight = data.reduce((max, next) => Math.max(max, next.value), 0);

    return (
      <div style={{
        width: '640px',
        height: '240px',
        backgroundColor: 'gray',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
      }}>
        {data.map(bin => (
          <div key={bin.label} style={{
            width: `${640 / data.length}px`,
            height: `${Math.max(1, 240 * (bin.value / maxHeight))}px`,
            backgroundColor: 'blue',
            position: 'relative',
          }}>
            <label style={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              color: 'white',
            }}>
              { bin.value }
            </label>
            <label style={{
              position: 'absolute',
              bottom: '-20px',
            }}>
              { bin.label }
            </label>
          </div>
        ))}
      </div>
    );
  }
}

class Runner extends Component {
  state = {
    keepGoing: true,
    runs: {}
  }

  componentDidMount() {
    this.runRandom();
    window.addEventListener('keydown', this.halt, false);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.halt, false);
  }

  addResult = (document, name, count, { parse, ...data }) => this.setState(({ runs }) => ({
    runs: {
      ...runs,
      [`${name}-${document}`]: [...(runs[`${name}-${document}`] || []), data]
    }
  }));

  halt = ({ key }) => {
    if (key === 'Escape') {
      this.setState({ keepGoing: false });
    }
  }

  run = (document, content, name, parser, count) => {
    this.setState({ current: `Running ${parser} ${count} times over ${document}` });
    const url = `${parser}?count=${count}`;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.onload = () => (this.addResult(document, name, count, JSON.parse(xhr.responseText)), this.runRandom());
    xhr.onerror = () => this.runRandom();
    xhr.send(content);
  }

  runRandom = () => {
    if (!this.state.keepGoing) {
      return;
    }

    const { documents, parsers } = this.props;

    const doc = sample(Object.keys(documents));
    const content = documents[doc];
    const name = sample(Object.keys(parsers));
    const parser = parsers[name];
    const count = random(1, 5);

    this.run(doc, content, name, parser, count);
  }

  getDataFor = (parser, doc) => {
    const { runs } = this.state;
    const { documents } = this.props;

    const runData = runs[`${parser}-${doc}`];

    if (!runData) {
      return [];
    }

    const us = runData.map(data => data['\u00b5sAvg']);

    // build a histogram
    const binCount = Math.min(10, us.length);
    const [min, max] = us.reduce(
      ([min, max], next) => [Math.min(min, next), Math.max(max, next)], [Infinity, -Infinity]
    );

    return range(0, binCount)
      .map(i => min + i * (max - min) / binCount)
      .map(left => [left, left + (max - min) / binCount])
      .map(([left, right]) => ({
        label: `${Math.round(left / 1000)} - ${Math.round(right / 1000)}`,
        value: us.filter(time => time >= left && time < right).length,
      }));
  }

  render() {
    const { current, keepGoing } = this.state;
    const { documents, parsers } = this.props;

    return (
      <Card>
        {keepGoing && (
          <Fragment>
            <p>Running! (Press <kbd>ESC</kbd> to stop)</p>
            <p>{current}</p>
          </Fragment>
        )}
        <p>Bins are measuring `ms` runtime for each parse</p>
        <ul>
          {Object.keys(documents).map(doc => (
            <li key={doc}>
              <p><strong>{doc}</strong></p>
              {Object.keys(parsers).map(parser => (
                <div key={parser}>
                  <p><em>{parser}</em></p>
                  <Histogram data={this.getDataFor(parser, doc)} />
                </div>
              ))}
            </li>
          ))}
        </ul>
      </Card>
    )
  }
}

class Comparator extends Component {
  state = {
    step: [
      [],
      ["pick-parsers", "load-library", "compare-outputs", "run-benchmark"]
    ]
  };

  nextStep = updates =>
    this.setState(({ step: [prev, [current, ...next]] }) => ({
      step: [[...prev, current], next],
      ...updates,
    }));

  render() {
    const [prevSteps, [currentStep, ...nextSteps]] = this.state.step;

    return (
      <div>
        {(() => {
          switch (currentStep) {
            case "pick-parsers":
              return <ParserPicker next={this.nextStep} />;
            case "load-library":
              return (
                <Fragment>
                  <ParserPicker />
                  <LibraryLoader next={this.nextStep} />
                </Fragment>
              );
            case 'compare-outputs':
              return (
                <Fragment>
                  <ParserPicker />
                  <LibraryLoader />
                  <OutputComparator
                    documents={this.state.documents}
                    next={this.nextStep}
                    parsers={this.state.parsers}
                  />
                </Fragment>
              );
            case 'run-benchmark':
              return (
                <Fragment>
                  <ParserPicker />
                  <LibraryLoader />
                  <OutputComparator
                    documents={this.state.documents}
                    next={this.nextStep}
                    parsers={this.state.parsers}
                  />
                  <Runner
                    documents={this.state.documents}
                    next={this.nextStep}
                    parsers={this.state.parsers}
                  />
                </Fragment>
              );
            default:
              return <p>Done!</p>;
          }
        })()}
      </div>
    );
  }
}

ReactDOM.render(<Comparator />, document.getElementById("root"));
